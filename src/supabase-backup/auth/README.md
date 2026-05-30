# 🔐 Auth Migration Guide

> Migrate dari Base44 Auth → Supabase Auth (Magic Link).

---

## 📁 Files dalam folder ini

| File | Tujuan | Replace |
|---|---|---|
| `supabaseClient.js` | Supabase client + compat shim untuk base44.* calls | `api/base44Client.js` |
| `AuthContext.jsx` | React context untuk auth state | `lib/AuthContext.jsx` |
| `Login.jsx` | Magic link login page | NEW |

---

## 🚀 Setup Steps

### 1. Install Supabase SDK
```bash
npm install @supabase/supabase-js
```

### 2. Add env variables (`.env` di frontend)
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Configure Supabase Auth Dashboard

Go to Supabase Dashboard → Authentication:

**Providers tab:**
- ✅ Enable Email (Magic Link)
- ❌ Disable Email + Password (atau enable jika nak support both)

**URL Configuration:**
- Site URL: `https://ceriakid.com`
- Redirect URLs:
  - `https://ceriakid.com/**`
  - `http://localhost:5173/**` (dev)

**Email Templates:**
- Customize "Magic Link" template (Subject + HTML)

### 4. Replace files dalam frontend

```bash
# Backup old files
mv src/api/base44Client.js src/api/base44Client.js.bak
mv src/lib/AuthContext.jsx src/lib/AuthContext.jsx.bak

# Copy new files
cp supabase-backup/auth/supabaseClient.js src/api/base44Client.js
cp supabase-backup/auth/AuthContext.jsx src/lib/AuthContext.jsx
cp supabase-backup/auth/Login.jsx src/pages/Login.jsx
```

### 5. Add Login route dalam App.jsx
```jsx
import Login from '@/pages/Login';

<Route path="/login" element={<Login />} />
```

---

## 🔄 Compat Shim — Bagi base44.* Calls Kerja

`supabaseClient.js` ada **compat layer** yang map Base44 SDK calls ke Supabase:

```js
// SEMUA INI MASIH BERFUNGSI tanpa perlu tukar code lain:
base44.auth.me()                      // → supabase.auth.getUser() + ck_users join
base44.entities.User.filter({...})    // → supabase.from('ck_users').select().eq()
base44.entities.User.create({...})    // → supabase.from('ck_users').insert()
base44.functions.invoke('chipCheckout', payload)  
                                       // → supabase.functions.invoke('chip-checkout')
```

**Frontend code anda tak perlu banyak tukar!** Cuma:
- Import path sama: `import { base44 } from '@/api/base44Client'`
- Calls sama: `base44.entities.X.list()`
- Function names auto-converted: `chipCheckout` → `chip-checkout`

---

## ⚠️ User Password Migration

Password Base44 **TIDAK BOLEH** migrate ke Supabase (different hash).

**Solution:**
- Magic link auth (no password needed) ← RECOMMENDED
- Bulk email semua existing users dengan "Login dengan email baharu"
- Lihat `docs/26_USER_PASSWORD_MIGRATION.md` untuk detail strategy

---

## ✅ Testing

```bash
# Test login flow
1. Buka /login
2. Masukkan email
3. Cek inbox untuk magic link
4. Klik link → auto-redirect ke /dashboard
5. base44.auth.me() return user object ✅
```

---

## 🛡️ Row Level Security (RLS)

Setelah migrate auth, set RLS policies untuk protect data:

```sql
-- Users boleh read profile sendiri
CREATE POLICY "users_select_own" ON ck_users
  FOR SELECT USING (auth.email() = email);

-- Users boleh update profile sendiri
CREATE POLICY "users_update_own" ON ck_users
  FOR UPDATE USING (auth.email() = email);

-- Admin boleh read semua
CREATE POLICY "admin_select_all" ON ck_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ck_users WHERE email = auth.email() AND role = 'admin')
  );

-- Pattern untuk user-owned entities
CREATE POLICY "user_owns_record" ON ck_user_subscriptions
  FOR ALL USING (auth.email() = email);
```

Apply pattern yang sama untuk:
- `ck_user_credits` (key: `user_email`)
- `ck_credit_transactions` (key: `user_email`)
- `ck_achievements` (key: `user_email`)
- `ck_friends` (key: `user_email` atau `friend_email`)

Service role (Edge Functions) bypass RLS — selamat untuk admin operations.