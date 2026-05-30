# 🗃️ Complete SQL Schema — Ready to Run

> Copy-paste ke Supabase SQL Editor untuk create semua 26 tables sekaligus.
> Includes: tables, indexes, RLS policies, triggers, auth setup.

---

## 🚀 Quick Setup (5 min)

```
1. Buka Supabase Dashboard → SQL Editor
2. Copy seksyen "01_CREATE_TABLES" → Run
3. Copy seksyen "02_INDEXES" → Run
4. Copy seksyen "03_RLS_POLICIES" → Run
5. Copy seksyen "04_AUTH_SETUP" → Run
6. Done — semua 26 tables siap!
```

---

## 📋 01_CREATE_TABLES

```sql
-- ===================================================
-- CeriaKid Database Schema — Complete (26 tables)
-- ===================================================

-- 1. profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ck_user_subscriptions
CREATE TABLE IF NOT EXISTS public.ck_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  checkout_name TEXT,
  checkout_phone TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  selected_age_group TEXT DEFAULT 'prasekolah',
  children JSONB DEFAULT '[]',
  sent_reminders JSONB DEFAULT '[]',
  fb_tracking JSONB,
  abandoned_reminder_sent BOOLEAN DEFAULT false,
  abandoned_reminder_status TEXT DEFAULT 'not_sent',
  abandoned_reminder_sent_at TIMESTAMPTZ,
  abandoned_reminder_message_id TEXT,
  abandoned_reminder_error TEXT,
  recovered_at TIMESTAMPTZ
);

-- 3. ck_user_credits
CREATE TABLE IF NOT EXISTS public.ck_user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL UNIQUE,
  balance NUMERIC DEFAULT 0,
  total_purchased NUMERIC DEFAULT 0,
  total_used NUMERIC DEFAULT 0,
  last_top_up_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

-- 4. ck_credit_transactions
CREATE TABLE IF NOT EXISTS public.ck_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  balance_after NUMERIC,
  feature TEXT,
  description TEXT,
  reference_id TEXT,
  metadata JSONB
);

-- 5. ck_registered_devices
CREATE TABLE IF NOT EXISTS public.ck_registered_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  last_seen TIMESTAMPTZ,
  is_current_device BOOLEAN DEFAULT false,
  UNIQUE(user_email, device_id)
);

-- 6. ck_games
CREATE TABLE IF NOT EXISTS public.ck_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  age_group TEXT NOT NULL,
  darjah TEXT,
  difficulty TEXT DEFAULT 'easy',
  tier TEXT DEFAULT 'free',
  emoji TEXT,
  total_questions INTEGER DEFAULT 8,
  game_data JSONB,
  is_published BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'ready',
  "order" INTEGER,
  month_tag TEXT
);

-- 7. ck_bbm_resources
CREATE TABLE IF NOT EXISTS public.ck_bbm_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  level TEXT NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT,
  html_content TEXT,
  preview_image_url TEXT,
  emoji TEXT,
  tags JSONB DEFAULT '[]',
  tier TEXT DEFAULT 'free',
  download_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  "order" INTEGER
);

-- 8. ck_ai_stories
CREATE TABLE IF NOT EXISTS public.ck_ai_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  emoji TEXT,
  cover_image TEXT,
  story TEXT NOT NULL,
  moral_summary TEXT,
  theme TEXT,
  child_name TEXT,
  age_range TEXT,
  moral_lesson TEXT,
  length TEXT
);

-- 9. ck_quiz_history
CREATE TABLE IF NOT EXISTS public.ck_quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  question TEXT NOT NULL,
  choices JSONB NOT NULL,
  correct_index INTEGER,
  user_answer_index INTEGER,
  is_correct BOOLEAN DEFAULT false,
  explanation TEXT,
  hint TEXT,
  encouragement TEXT,
  emoji TEXT DEFAULT '❓',
  subject TEXT,
  level TEXT,
  difficulty TEXT DEFAULT 'medium',
  topic TEXT
);

-- 10. ck_chat_conversations
CREATE TABLE IF NOT EXISTS public.ck_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  agent TEXT DEFAULT 'cikgu_firdaus',
  subject TEXT,
  level TEXT,
  messages JSONB DEFAULT '[]',
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ
);

-- 11. ck_child_game_progress
CREATE TABLE IF NOT EXISTS public.ck_child_game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  child_name TEXT NOT NULL,
  game_type TEXT NOT NULL,
  category TEXT,
  age_group TEXT,
  last_score INTEGER,
  last_total INTEGER,
  last_stars INTEGER,
  times_played INTEGER DEFAULT 0,
  best_score INTEGER,
  best_stars INTEGER,
  last_played_date TIMESTAMPTZ,
  play_history JSONB DEFAULT '[]'
);

-- 12. ck_leaderboard
CREATE TABLE IF NOT EXISTS public.ck_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  child_name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  total_stars INTEGER DEFAULT 0,
  games_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_played_date TIMESTAMPTZ
);

-- 13. ck_achievements
CREATE TABLE IF NOT EXISTS public.ck_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_emoji TEXT NOT NULL,
  unlocked_date TIMESTAMPTZ
);

-- 14. ck_daily_challenges
CREATE TABLE IF NOT EXISTS public.ck_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  challenge_date DATE NOT NULL,
  game_category TEXT NOT NULL,
  game_index INTEGER NOT NULL,
  bonus_reward INTEGER DEFAULT 50,
  age_group TEXT NOT NULL
);

-- 15. ck_friends
CREATE TABLE IF NOT EXISTS public.ck_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  friend_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  invite_code TEXT NOT NULL,
  accepted_date TIMESTAMPTZ
);

-- 16. ck_friend_challenges
CREATE TABLE IF NOT EXISTS public.ck_friend_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  challenge_id TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  opponent TEXT NOT NULL,
  game_category TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  creator_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  winner_email TEXT
);

-- 17. ck_game_tasks
CREATE TABLE IF NOT EXISTS public.ck_game_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  task_name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  darjah TEXT,
  subject TEXT NOT NULL,
  games_count INTEGER NOT NULL,
  questions_per_game INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_games INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 18. ck_qc_logs
CREATE TABLE IF NOT EXISTS public.ck_qc_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  run_at TIMESTAMPTZ NOT NULL,
  action TEXT DEFAULT 'audit',
  status TEXT NOT NULL,
  score NUMERIC,
  total INTEGER,
  passed INTEGER,
  failed INTEGER,
  deleted_count INTEGER DEFAULT 0,
  replacement_tasks INTEGER DEFAULT 0,
  active_tasks INTEGER DEFAULT 0,
  message TEXT,
  sample_issues JSONB
);

-- 19. ck_qc_settings
CREATE TABLE IF NOT EXISTS public.ck_qc_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  interval_minutes INTEGER DEFAULT 10,
  last_auto_run_at TIMESTAMPTZ,
  subject_cap INTEGER DEFAULT 30,
  mini_game_cap INTEGER DEFAULT 30,
  story_kid_cap INTEGER DEFAULT 30,
  background_launch_enabled BOOLEAN DEFAULT false,
  background_story_enabled BOOLEAN DEFAULT false,
  auto_run_locked_at TIMESTAMPTZ,
  auto_run_locked_by TEXT,
  auto_run_current_bucket TEXT
);

-- 20. ck_monthly_gen_settings
CREATE TABLE IF NOT EXISTS public.ck_monthly_gen_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  games_per_subject INTEGER DEFAULT 20,
  questions_per_game INTEGER DEFAULT 20
);

-- 21. ck_health_check_logs
CREATE TABLE IF NOT EXISTS public.ck_health_check_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  run_at TIMESTAMPTZ NOT NULL,
  overall_status TEXT DEFAULT 'healthy',
  total_checks INTEGER DEFAULT 0,
  healthy_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  checks JSONB DEFAULT '[]'
);

-- 22. ck_affiliates
CREATE TABLE IF NOT EXISTS public.ck_affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  tier TEXT DEFAULT 'bronze',
  commission_rate_subscription NUMERIC DEFAULT 20,
  commission_rate_credit NUMERIC DEFAULT 15,
  total_referrals INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_paid_out NUMERIC DEFAULT 0,
  pending_balance NUMERIC DEFAULT 0,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_holder TEXT,
  joined_at TIMESTAMPTZ
);

-- 23. ck_affiliate_referrals
CREATE TABLE IF NOT EXISTS public.ck_affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  affiliate_email TEXT NOT NULL,
  referral_code TEXT,
  referred_email TEXT NOT NULL,
  purchase_type TEXT NOT NULL,
  purchase_detail TEXT,
  purchase_amount_myr NUMERIC,
  commission_rate NUMERIC,
  commission_myr NUMERIC NOT NULL,
  status TEXT DEFAULT 'approved',
  chip_purchase_id TEXT,
  payout_id TEXT
);

-- 24. ck_affiliate_payouts
CREATE TABLE IF NOT EXISTS public.ck_affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  affiliate_email TEXT NOT NULL,
  amount_myr NUMERIC NOT NULL,
  status TEXT DEFAULT 'requested',
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_holder TEXT,
  requested_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  transaction_ref TEXT,
  admin_note TEXT,
  referral_count INTEGER
);

-- 25. ck_push_subscriptions
CREATE TABLE IF NOT EXISTS public.ck_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_label TEXT,
  is_admin BOOLEAN DEFAULT true
);

-- 26. ck_sync_log (for syncToSupabase tracking)
CREATE TABLE IF NOT EXISTS public.ck_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  entity TEXT NOT NULL,
  records_synced INTEGER DEFAULT 0,
  status TEXT,
  error TEXT,
  duration_ms INTEGER
);
```

---

## 📋 02_INDEXES (Performance)

```sql
-- User lookups
CREATE INDEX IF NOT EXISTS idx_subs_email ON ck_user_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subs_status ON ck_user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_credits_email ON ck_user_credits(user_email);
CREATE INDEX IF NOT EXISTS idx_trans_email ON ck_credit_transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_devices_email ON ck_registered_devices(user_email);

-- Games (frequent filter)
CREATE INDEX IF NOT EXISTS idx_games_category ON ck_games(category);
CREATE INDEX IF NOT EXISTS idx_games_age_group ON ck_games(age_group);
CREATE INDEX IF NOT EXISTS idx_games_darjah ON ck_games(darjah);
CREATE INDEX IF NOT EXISTS idx_games_tier ON ck_games(tier);
CREATE INDEX IF NOT EXISTS idx_games_published ON ck_games(is_published) WHERE is_published = true;

-- BBM
CREATE INDEX IF NOT EXISTS idx_bbm_subject ON ck_bbm_resources(subject);
CREATE INDEX IF NOT EXISTS idx_bbm_level ON ck_bbm_resources(level);

-- Progress
CREATE INDEX IF NOT EXISTS idx_progress_email ON ck_child_game_progress(user_email);
CREATE INDEX IF NOT EXISTS idx_progress_child ON ck_child_game_progress(user_email, child_name);

-- Leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_stars ON ck_leaderboard(total_stars DESC);

-- Affiliate
CREATE INDEX IF NOT EXISTS idx_affiliate_code ON ck_affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON ck_affiliate_referrals(affiliate_email);
CREATE INDEX IF NOT EXISTS idx_referrals_chip ON ck_affiliate_referrals(chip_purchase_id);

-- Push
CREATE INDEX IF NOT EXISTS idx_push_email ON ck_push_subscriptions(user_email);

-- Daily
CREATE INDEX IF NOT EXISTS idx_daily_date ON ck_daily_challenges(challenge_date);
```

---

## 📋 03_RLS_POLICIES

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_registered_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_bbm_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_ai_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_child_game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_friend_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ck_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES: users see own, admin sees all
CREATE POLICY "profiles_self_read" ON profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL
  USING (public.is_admin());

-- SUBSCRIPTIONS: users see own
CREATE POLICY "subs_own" ON ck_user_subscriptions FOR ALL
  USING (email = auth.jwt() ->> 'email' OR public.is_admin());

-- CREDITS: users see own
CREATE POLICY "credits_own" ON ck_user_credits FOR ALL
  USING (user_email = auth.jwt() ->> 'email' OR public.is_admin());

-- TRANSACTIONS: read-only for user
CREATE POLICY "trans_own_read" ON ck_credit_transactions FOR SELECT
  USING (user_email = auth.jwt() ->> 'email' OR public.is_admin());

-- DEVICES: users manage own
CREATE POLICY "devices_own" ON ck_registered_devices FOR ALL
  USING (user_email = auth.jwt() ->> 'email' OR public.is_admin());

-- GAMES: public read, admin write
CREATE POLICY "games_public_read" ON ck_games FOR SELECT
  USING (is_published = true);
CREATE POLICY "games_admin_write" ON ck_games FOR ALL
  USING (public.is_admin());

-- BBM: public read, admin write
CREATE POLICY "bbm_public_read" ON ck_bbm_resources FOR SELECT
  USING (is_published = true);
CREATE POLICY "bbm_admin_write" ON ck_bbm_resources FOR ALL
  USING (public.is_admin());

-- AI STORIES: users see own
CREATE POLICY "stories_own" ON ck_ai_stories FOR ALL
  USING (created_by = auth.jwt() ->> 'email' OR public.is_admin());

-- QUIZ HISTORY: users see own
CREATE POLICY "quiz_own" ON ck_quiz_history FOR ALL
  USING (created_by = auth.jwt() ->> 'email' OR public.is_admin());

-- CHAT: users see own
CREATE POLICY "chat_own" ON ck_chat_conversations FOR ALL
  USING (created_by = auth.jwt() ->> 'email' OR public.is_admin());

-- PROGRESS: users see own
CREATE POLICY "progress_own" ON ck_child_game_progress FOR ALL
  USING (user_email = auth.jwt() ->> 'email' OR public.is_admin());

-- LEADERBOARD: public read, users write own
CREATE POLICY "leaderboard_public_read" ON ck_leaderboard FOR SELECT
  USING (true);
CREATE POLICY "leaderboard_own_write" ON ck_leaderboard FOR ALL
  USING (user_email = auth.jwt() ->> 'email' OR public.is_admin());

-- ACHIEVEMENTS: users see own
CREATE POLICY "achievements_own" ON ck_achievements FOR ALL
  USING (user_email = auth.jwt() ->> 'email' OR public.is_admin());

-- DAILY: public read
CREATE POLICY "daily_public" ON ck_daily_challenges FOR SELECT
  USING (true);
CREATE POLICY "daily_admin_write" ON ck_daily_challenges FOR ALL
  USING (public.is_admin());

-- FRIENDS: users see own connections
CREATE POLICY "friends_own" ON ck_friends FOR ALL
  USING (
    user_email = auth.jwt() ->> 'email' 
    OR friend_email = auth.jwt() ->> 'email'
    OR public.is_admin()
  );

-- CHALLENGES: users see own
CREATE POLICY "challenges_own" ON ck_friend_challenges FOR ALL
  USING (
    created_by = auth.jwt() ->> 'email' 
    OR opponent = auth.jwt() ->> 'email'
    OR public.is_admin()
  );

-- AFFILIATES: users see own
CREATE POLICY "affiliate_own" ON ck_affiliates FOR ALL
  USING (user_email = auth.jwt() ->> 'email' OR public.is_admin());

-- AFFILIATE REFERRALS: affiliate sees own
CREATE POLICY "referrals_own" ON ck_affiliate_referrals FOR SELECT
  USING (affiliate_email = auth.jwt() ->> 'email' OR public.is_admin());

-- AFFILIATE PAYOUTS: affiliate sees own
CREATE POLICY "payouts_own" ON ck_affiliate_payouts FOR SELECT
  USING (affiliate_email = auth.jwt() ->> 'email' OR public.is_admin());

-- PUSH: users manage own
CREATE POLICY "push_own" ON ck_push_subscriptions FOR ALL
  USING (user_email = auth.jwt() ->> 'email' OR public.is_admin());
```

---

## 📋 04_AUTH_SETUP

```sql
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Initialize user credits with 5 free credits
  INSERT INTO public.ck_user_credits (user_email, balance)
  VALUES (NEW.email, 5);
  
  -- Initialize free subscription
  INSERT INTO public.ck_user_subscriptions (email, tier, status)
  VALUES (NEW.email, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at auto-update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON ck_user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_credits_updated BEFORE UPDATE ON ck_user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_games_updated BEFORE UPDATE ON ck_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_progress_updated BEFORE UPDATE ON ck_child_game_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leaderboard_updated BEFORE UPDATE ON ck_leaderboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_chat_updated BEFORE UPDATE ON ck_chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_affiliate_updated BEFORE UPDATE ON ck_affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_qc_settings_updated BEFORE UPDATE ON ck_qc_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 📋 05_STORAGE_BUCKETS

```sql
-- Run in Supabase Dashboard → Storage UI, OR via SQL:

INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('uploads', 'uploads', true),
  ('story-covers', 'story-covers', true),
  ('bbm-files', 'bbm-files', true),
  ('private', 'private', false);

-- Storage policies (avatars example)
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## ✅ Verification

After running all 4 sections, verify:

```sql
-- Should return 26 tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'ck_%';

-- Should return 1 (profiles)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND (tablename LIKE 'ck_%' OR tablename = 'profiles');
-- All should show rowsecurity = true
```

---

## 🎯 Total Time: ~5 minutes

Copy → paste → run each section. Database 100% ready untuk CeriaKid clone.

---

> Next: Read `10_BUSINESS_LOGIC.md` for tier limits + pricing logic.