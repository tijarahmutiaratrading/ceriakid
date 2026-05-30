# 🔐 Authentication Flow

> How users authenticate in CeriaKid + how to migrate to Supabase Auth.
> Last updated: 2026-05-30

---

## 🎯 Current Auth (Base44)

CeriaKid uses **Base44's built-in auth** — magic link / passwordless email.

### Flow Overview
```
1. User clicks "Login" → redirect to Base44 auth page
2. User enters email → Base44 sends magic link
3. User clicks link → redirect back to app with token
4. base44.auth.me() returns user object
5. App stores session in cookie (managed by Base44)
```

### Key SDK Methods Used
| Method | Purpose | Used In |
|---|---|---|
| `base44.auth.me()` | Get current user | `lib/AuthContext.jsx` |
| `base44.auth.isAuthenticated()` | Check session | `App.jsx`, route guards |
| `base44.auth.redirectToLogin(nextUrl)` | Trigger login | Landing CTAs |
| `base44.auth.logout(redirectUrl)` | End session | Settings page |
| `base44.auth.updateMe(data)` | Update user profile | Profile editor |

### User Object Shape (from `base44.auth.me()`)
```js
{
  id: "uuid",
  email: "user@example.com",
  full_name: "Ahmad bin Ali",
  role: "user" | "admin",
  created_date: "2026-01-15T...",
  // + any custom fields from User entity
  selectedAgeGroup: "prasekolah",
  children: [...],
  // ... etc
}
```

---

## 🔄 Migration to Supabase Auth

### Method Translation Table

| Base44 (Current) | Supabase Equivalent | Notes |
|---|---|---|
| `base44.auth.me()` | `supabase.auth.getUser()` | Returns `{ data: { user } }` |
| `base44.auth.isAuthenticated()` | `supabase.auth.getSession()` | Check if session exists |
| `base44.auth.redirectToLogin(url)` | `supabase.auth.signInWithOtp({email})` | Magic link option |
| `base44.auth.logout()` | `supabase.auth.signOut()` | Same behavior |
| `base44.auth.updateMe(data)` | `supabase.from('users').update(data).eq('id', userId)` | Direct table update |

### Code Translation Example

**BEFORE (Base44):**
```js
import { base44 } from '@/api/base44Client';

const user = await base44.auth.me();
if (!user) {
  base44.auth.redirectToLogin('/dashboard');
}
```

**AFTER (Supabase):**
```js
import { supabase } from '@/lib/supabaseClient';

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  await supabase.auth.signInWithOtp({
    email: userEnteredEmail,
    options: { emailRedirectTo: `${window.location.origin}/dashboard` }
  });
}
```

### Supabase Client Setup

Create `lib/supabaseClient.js`:
```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
```

---

## ⚠️ Critical Migration Gotchas

### 1. Passwords TIDAK Dapat Migrate
```
❌ Base44 password hashes ≠ Supabase password hashes
✅ Solution: Force ALL users reset password
   - Email semua users dengan link reset
   - Atau use magic link only (no password)
```

### 2. User Sessions Akan Hilang
```
❌ Semua cookie Base44 tak valid kat Supabase
✅ Solution: User kena login balik sekali
   - Tunjuk notice "Sistem dah upgrade, sila login semula"
```

### 3. User Profile Data Preserved
```
✅ Email, full_name, role, custom fields — semua dah sync ke Supabase
✅ Cuma authentication credentials je hilang
```

### 4. Email Verification Status
```
⚠️ Base44 verified users mungkin perlu re-verify dalam Supabase
✅ Boleh manual update kat Supabase Dashboard → Authentication → Users
   → set email_confirmed_at untuk users existing
```

---

## 🛠️ Setup Supabase Auth (Production)

### Step 1: Enable Auth Providers
```
Supabase Dashboard → Authentication → Providers
✅ Email (magic link) — RECOMMENDED
✅ Email + Password — optional
```

### Step 2: Configure Email Templates
```
Authentication → Email Templates
- Confirm signup
- Magic link
- Change email
- Reset password
```

### Step 3: Set Redirect URLs
```
Authentication → URL Configuration
- Site URL: https://your-new-domain.com
- Redirect URLs (whitelist):
  - https://your-new-domain.com/**
  - http://localhost:5173/** (for dev)
```

### Step 4: Sync Existing Users
```sql
-- Migrate users dari old users table ke auth.users
-- (Jalankan kat Supabase SQL Editor)

INSERT INTO auth.users (id, email, email_confirmed_at, created_at, raw_user_meta_data)
SELECT 
  id,
  email,
  created_date AS email_confirmed_at,  -- assume confirmed
  created_date AS created_at,
  jsonb_build_object('full_name', full_name, 'role', role)
FROM public.users
ON CONFLICT (email) DO NOTHING;
```

---

## 🔒 Row Level Security (RLS) Policies

Selepas migrate auth, setup RLS untuk protect data:

```sql
-- Users can only read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile  
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "admins_select_all" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Pattern for user-owned entities (apply to UserSubscription, Achievement, etc.)
CREATE POLICY "user_owns_record" ON user_subscriptions
  FOR ALL USING (auth.jwt() ->> 'email' = email);
```

---

## 🎯 AuthContext.jsx Translation

**BEFORE (Base44):**
```jsx
import { base44 } from '@/api/base44Client';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
  
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};
```

**AFTER (Supabase):**
```jsx
import { supabase } from '@/lib/supabaseClient';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};
```

---

## 📋 Migration Checklist

```
□ Setup Supabase Auth providers
□ Configure email templates (magic link)
□ Set redirect URLs whitelist
□ Migrate users dari old users table ke auth.users
□ Add RLS policies untuk all entities
□ Create supabaseClient.js
□ Translate AuthContext.jsx
□ Replace all base44.auth.X calls (use find/replace)
□ Test login flow end-to-end
□ Send "system upgrade" notice email ke all users
□ Force password reset campaign
```

---

> 💡 **Pro tip:** Magic link auth = no passwords needed = no migration pain. Recommend disable password auth, force magic link only.