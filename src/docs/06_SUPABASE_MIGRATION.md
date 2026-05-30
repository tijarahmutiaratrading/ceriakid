# 🔄 Supabase Migration Guide

> Complete translation guide: Base44 SDK → Supabase

---

## 🎯 Migration Philosophy

**Goal:** Convert CeriaKid from Base44-dependent to Supabase-native.

**Approach:**
1. ✅ Keep React frontend (mostly unchanged)
2. ✅ Replace Base44 SDK calls with Supabase SDK
3. ✅ Convert Deno serverless functions → Supabase Edge Functions
4. ✅ Replace Base44 Auth with Supabase Auth
5. ✅ Replace Base44 InvokeLLM with direct OpenAI/Anthropic

---

## 📦 Step 1: Setup Supabase Project

### 1.1 Create Project
```
1. Go to https://app.supabase.com
2. Create new project (already done if data is synced)
3. Note down:
   - Project URL: https://xxx.supabase.co
   - Anon Key: eyJhbGc...
   - Service Role Key: eyJhbGc... (KEEP PRIVATE)
```

### 1.2 Verify Existing Schema
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'ck_%'
ORDER BY table_name;

-- Should return 26 tables (ck_users, ck_games, etc.)
```

### 1.3 Verify Data
```sql
SELECT 
  'ck_users' as table_name, COUNT(*) as count FROM ck_users
UNION ALL SELECT 'ck_games', COUNT(*) FROM ck_games
UNION ALL SELECT 'ck_user_subscriptions', COUNT(*) FROM ck_user_subscriptions
-- ... all 26 tables
;
```

---

## 🔌 Step 2: Connect from Frontend

### 2.1 Install Supabase SDK
```bash
npm install @supabase/supabase-js
```

### 2.2 Create Client (`src/lib/supabase.js`)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

### 2.3 Environment Variables (`.env.local`)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🔐 Step 3: Auth Migration

### 3.1 Setup Supabase Auth

**Email + OTP (match Base44 behavior):**
```
1. Supabase Dashboard → Authentication → Providers
2. Enable: Email
3. Settings:
   - Confirm email: ON
   - Enable OTP: ON
   - OTP length: 6 digits
   - OTP expiry: 60 minutes
4. Customize email templates (welcome, OTP)
```

### 3.2 Auth Pattern Translation

**Base44:**
```javascript
const user = await base44.auth.me();
const isAuth = await base44.auth.isAuthenticated();
await base44.auth.redirectToLogin();
await base44.auth.logout();
await base44.auth.updateMe({ avatarUrl: '...' });
```

**Supabase:**
```javascript
// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Check auth
const { data: { session } } = await supabase.auth.getSession();
const isAuth = !!session;

// Login (OTP)
await supabase.auth.signInWithOtp({ email: 'user@example.com' });

// Logout
await supabase.auth.signOut();

// Update user metadata
await supabase.auth.updateUser({
  data: { avatarUrl: '...' }
});

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
});
```

### 3.3 Custom Profile Table

Since Supabase auth users only have basic fields, create profile table:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3.4 Migrate Existing Users

**Option A: Re-invite users (cleanest)**
- Send "Migration complete" email
- Users login → auto-create new account

**Option B: Bulk import**
```sql
-- Insert from Base44 export
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  gen_random_uuid(),
  email,
  full_name,
  role
FROM imported_users_csv;

-- Users need to set password on first login
```

---

## 📊 Step 4: Database Operations Translation

### 4.1 Entity Operations Cheat Sheet

| Base44 | Supabase |
|---|---|
| `Entity.list()` | `.from('table').select('*')` |
| `Entity.list('-created_date')` | `.from('table').select('*').order('created_at', { ascending: false })` |
| `Entity.list('-created_date', 20)` | `.from('table').select('*').order('created_at', { ascending: false }).limit(20)` |
| `Entity.filter({ status: 'active' })` | `.from('table').select('*').eq('status', 'active')` |
| `Entity.filter({ status: 'active' }, '-date', 10)` | `.from('table').select('*').eq('status', 'active').order('date', { ascending: false }).limit(10)` |
| `Entity.get(id)` | `.from('table').select('*').eq('id', id).single()` |
| `Entity.create({...})` | `.from('table').insert([{...}]).select()` |
| `Entity.bulkCreate([...])` | `.from('table').insert([...]).select()` |
| `Entity.update(id, {...})` | `.from('table').update({...}).eq('id', id).select()` |
| `Entity.delete(id)` | `.from('table').delete().eq('id', id)` |

### 4.2 Real Examples

**List recent games:**
```javascript
// Base44
const games = await base44.entities.Game.list('-created_date', 20);

// Supabase
const { data: games } = await supabase
  .from('ck_games')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20);
```

**Filter user's subscription:**
```javascript
// Base44
const subs = await base44.entities.UserSubscription.filter({
  email: user.email,
  status: 'active'
});

// Supabase
const { data: subs } = await supabase
  .from('ck_user_subscriptions')
  .select('*')
  .eq('email', user.email)
  .eq('status', 'active');
```

**Complex queries:**
```javascript
// Base44 (limited query power)
const games = await base44.entities.Game.filter({
  category: 'bahasa_melayu',
  tier: 'free'
}, '-created_date', 50);

// Supabase (more powerful)
const { data: games } = await supabase
  .from('ck_games')
  .select('*')
  .eq('category', 'bahasa_melayu')
  .in('tier', ['free', 'premium'])
  .gte('created_at', '2026-01-01')
  .order('created_at', { ascending: false })
  .range(0, 49);  // Pagination
```

### 4.3 Joins (Supabase advantage!)
```javascript
// Get user with all their progress
const { data } = await supabase
  .from('profiles')
  .select(`
    *,
    ck_child_game_progress (*),
    ck_leaderboard (*),
    ck_achievements (*)
  `)
  .eq('id', userId)
  .single();
```

### 4.4 Real-time Subscriptions
```javascript
// Base44
const unsubscribe = base44.entities.Game.subscribe((event) => {
  console.log(event.type, event.data);
});

// Supabase (more powerful)
const channel = supabase
  .channel('games-changes')
  .on('postgres_changes', {
    event: '*',  // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'ck_games',
    filter: 'category=eq.bahasa_melayu'  // Optional filter
  }, (payload) => {
    console.log(payload.eventType, payload.new, payload.old);
  })
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

---

## 🛡️ Step 5: Row Level Security (RLS)

**Critical:** Enable RLS untuk semua tables, define policies.

### 5.1 Enable RLS
```sql
ALTER TABLE ck_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_user_credits ENABLE ROW LEVEL SECURITY;
-- ... for all 26 tables
```

### 5.2 Common Policies

**Public read (Games):**
```sql
CREATE POLICY "games_public_read" ON ck_games
  FOR SELECT 
  USING (is_published = true);
```

**User owns their data:**
```sql
CREATE POLICY "users_own_subscription_read" ON ck_user_subscriptions
  FOR SELECT 
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "users_own_subscription_update" ON ck_user_subscriptions
  FOR UPDATE
  USING (email = auth.jwt() ->> 'email');
```

**Admin full access:**
```sql
CREATE POLICY "admin_full_access" ON ck_users
  FOR ALL 
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

**Per-child progress:**
```sql
CREATE POLICY "child_progress_own_only" ON ck_child_game_progress
  FOR ALL
  USING (user_email = auth.jwt() ->> 'email');
```

---

## ⚙️ Step 6: Edge Functions Migration

### 6.1 Function Structure Comparison

**Base44 (`functions/myFunction.js`):**
```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  const games = await base44.entities.Game.list();
  
  return Response.json({ games });
});
```

**Supabase Edge Function (`supabase/functions/my-function/index.ts`):**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization')!;
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const body = await req.json();
  const { data: games } = await supabase.from('ck_games').select('*');
  
  return new Response(JSON.stringify({ games }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### 6.2 Deploy Edge Function
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Init project
supabase init

# Create function
supabase functions new myFunction

# Deploy
supabase functions deploy myFunction

# Set secrets
supabase secrets set CHIP_SECRET_KEY=sk_...
supabase secrets set RESEND_API_KEY=re_...
```

### 6.3 Call from Frontend
```javascript
// Replace base44.functions.invoke()
const { data, error } = await supabase.functions.invoke('myFunction', {
  body: { param: 'value' }
});
```

---

## 🤖 Step 7: AI Migration (Off InvokeLLM)

### 7.1 Get OpenAI API Key
```
1. https://platform.openai.com/api-keys
2. Create new key
3. Save as OPENAI_API_KEY in Supabase secrets
```

### 7.2 Replace InvokeLLM Calls

**Before:**
```javascript
const result = await base44.integrations.Core.InvokeLLM({
  prompt: "Generate a quiz question",
  model: "gpt-5-mini",
  response_json_schema: { /* ... */ }
});
```

**After:**
```javascript
import OpenAI from 'npm:openai';

const openai = new OpenAI({ 
  apiKey: Deno.env.get('OPENAI_API_KEY') 
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are Cikgu Firdaus...' },
    { role: 'user', content: prompt }
  ],
  response_format: { type: 'json_object' }
});

const result = JSON.parse(completion.choices[0].message.content);
```

### 7.3 Image Generation (DALL-E)
```javascript
const response = await openai.images.generate({
  model: 'dall-e-3',
  prompt: 'Pixar 3D child character...',
  size: '1024x1024',
  quality: 'standard',
  n: 1
});

const imageUrl = response.data[0].url;

// Download & re-upload to Supabase Storage (URLs expire!)
const imageRes = await fetch(imageUrl);
const blob = await imageRes.blob();
const { data } = await supabase.storage
  .from('story-covers')
  .upload(`${storyId}.png`, blob);
```

---

## 📁 Step 8: File Storage Migration

### 8.1 Create Buckets
```sql
-- In Supabase Dashboard → Storage
1. Create bucket: 'avatars' (public)
2. Create bucket: 'uploads' (public)
3. Create bucket: 'story-covers' (public)
4. Create bucket: 'private' (private — signed URLs only)
```

### 8.2 Storage Policies
```sql
-- Anyone can view avatars
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "users_upload_own_avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 8.3 Upload Pattern
```javascript
// Before (Base44)
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// After (Supabase)
const fileName = `${user.id}/${Date.now()}_${file.name}`;
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });

const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(fileName);
```

### 8.4 Migrate Existing Files
```javascript
// Script untuk download from Base44 → upload to Supabase
const users = await base44.entities.User.list();

for (const user of users) {
  if (!user.avatarUrl) continue;
  
  // Download from Base44
  const res = await fetch(user.avatarUrl);
  const blob = await res.blob();
  
  // Upload to Supabase
  const fileName = `${user.id}/avatar.png`;
  await supabase.storage
    .from('avatars')
    .upload(fileName, blob);
  
  // Update user record with new URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);
}
```

---

## 📅 Step 9: Scheduled Functions (Cron)

### 9.1 Supabase Cron (pg_cron)
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a function call
SELECT cron.schedule(
  'sync-job',
  '0 */6 * * *',  -- Every 6 hours
  $$
  SELECT net.http_post(
    url := 'https://xxx.supabase.co/functions/v1/syncToSupabase',
    headers := '{"Authorization": "Bearer SERVICE_KEY"}'::jsonb
  );
  $$
);

-- List jobs
SELECT * FROM cron.job;

-- Remove job
SELECT cron.unschedule('sync-job');
```

### 9.2 Common Cron Schedules
| Function | Schedule | Cron |
|---|---|---|
| sendAbandonedCartReminders | Every hour | `0 * * * *` |
| sendExpiryReminders | Daily 9am | `0 9 * * *` |
| sendStreakReminders | Daily 7pm | `0 19 * * *` |
| sendWeeklyProgressReport | Sunday 6pm | `0 18 * * 0` |
| runHealthCheck | Every hour | `0 * * * *` |
| cleanupStuckSubscriptions | Daily 2am | `0 2 * * *` |

---

## 🌐 Step 10: Hosting (Vercel/Netlify)

### 10.1 Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_FB_PIXEL_ID
# VITE_VAPID_PUBLIC_KEY
```

### 10.2 Custom Domain
```
1. Add domain in Vercel dashboard
2. Update DNS at registrar
3. Wait for SSL provisioning
4. Update CHIP webhook URL to new domain
```

---

## ✅ Migration Checklist

### Pre-migration:
- [ ] All data synced to Supabase (verify counts)
- [ ] All secrets documented (08_SECRETS_AND_ENV.md)
- [ ] All files backed up (avatars, uploads)
- [ ] GitHub repo up-to-date
- [ ] Email users about planned downtime

### During migration:
- [ ] Create new Supabase project (or use existing)
- [ ] Setup auth (email + OTP)
- [ ] Enable RLS + policies for all tables
- [ ] Create storage buckets
- [ ] Migrate file uploads
- [ ] Deploy Edge Functions (start with critical ones)
- [ ] Update CHIP webhook URL
- [ ] Update FB CAPI URL
- [ ] Update VAPID subscription URL

### Frontend updates:
- [ ] Install @supabase/supabase-js
- [ ] Create supabase client
- [ ] Replace AuthContext logic
- [ ] Update all `base44.entities.*` calls → `supabase.from(*)`
- [ ] Update all `base44.functions.invoke()` → `supabase.functions.invoke()`
- [ ] Update file uploads
- [ ] Update real-time subscriptions
- [ ] Test all critical paths

### Post-migration:
- [ ] Deploy to Vercel/Netlify
- [ ] Update custom domain DNS
- [ ] Verify CHIP webhook works
- [ ] Verify emails sending
- [ ] Verify AI calls working
- [ ] Verify push notifications
- [ ] Monitor errors for 48 hours
- [ ] Announce migration complete

---

## ⏱️ Migration Timeline Estimate

| Phase | Effort | Duration |
|---|---|---|
| Setup Supabase project | Easy | 1 day |
| Auth migration | Medium | 2-3 days |
| Frontend code updates | Hard | 1 week |
| Edge functions (critical 10) | Hard | 1 week |
| Edge functions (remaining) | Medium | 1 week |
| File migration | Medium | 2 days |
| Testing | Hard | 1 week |
| Bug fixes & polish | Medium | 1 week |

**Total: 4-6 weeks for solo developer**

---

> Next: Read `07_RECOVERY_PLAYBOOK.md` for emergency procedures.