// ─────────────────────────────────────────────────────
// Supabase Client — Frontend
// Replaces @/api/base44Client
// ─────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ─────────────────────────────────────────────────────
// Compat shim — bagi base44.* calls boleh map ke supabase
// Gunanya untuk minimize frontend code changes
// ─────────────────────────────────────────────────────

export const base44 = {
  // Auth
  auth: {
    async me() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Get full profile from ck_users
      const { data: profile } = await supabase
        .from('ck_users')
        .select('*')
        .eq('email', user.email)
        .single();
      return { ...user, ...profile };
    },

    async isAuthenticated() {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },

    async logout(redirectUrl) {
      await supabase.auth.signOut();
      if (redirectUrl) window.location.href = redirectUrl;
      else window.location.reload();
    },

    redirectToLogin(nextUrl) {
      const next = nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : '';
      window.location.href = `/login${next}`;
    },

    async updateMe(data) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: updated } = await supabase
        .from('ck_users')
        .update(data)
        .eq('email', user.email)
        .select()
        .single();
      return updated;
    },
  },

  // Functions
  functions: {
    async invoke(name, payload) {
      // Convert camelCase → kebab-case (chipCheckout → chip-checkout)
      const kebabName = name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).replace(/^-/, '');
      const { data, error } = await supabase.functions.invoke(kebabName, { body: payload });
      if (error) throw error;
      return { data };
    },
  },

  // Entities — generic wrapper
  entities: createEntitiesProxy(),
};

// Explicit entity → table map (avoid PascalCase conversion edge cases like AIStory/BBMResource/QCLog)
const ENTITY_TABLE_MAP = {
  User: 'ck_users',
  UserSubscription: 'ck_user_subscriptions',
  UserCredit: 'ck_user_credits',
  CreditTransaction: 'ck_credit_transactions',
  Affiliate: 'ck_affiliates',
  AffiliateReferral: 'ck_affiliate_referrals',
  AffiliatePayout: 'ck_affiliate_payouts',
  Game: 'ck_games',
  AIStory: 'ck_ai_stories',
  BBMResource: 'ck_bbm_resources',
  PushSubscription: 'ck_push_subscriptions',
  ChatConversation: 'ck_chat_conversations',
  QuizHistory: 'ck_quiz_history',
  RegisteredDevice: 'ck_registered_devices',
  ChildGameProgress: 'ck_child_game_progress',
  Leaderboard: 'ck_leaderboards',
  Achievement: 'ck_achievements',
  DailyChallenge: 'ck_daily_challenges',
  Friend: 'ck_friends',
  FriendChallenge: 'ck_friend_challenges',
  GameTask: 'ck_game_tasks',
  QCLog: 'ck_qc_logs',
  QCSetting: 'ck_qc_settings',
  HealthCheckLog: 'ck_health_check_logs',
  MonthlyGenSetting: 'ck_monthly_gen_settings',
  SubscriptionTier: 'ck_subscription_tiers',
};

function entityNameToTable(name) {
  const mapped = ENTITY_TABLE_MAP[name];
  if (!mapped) throw new Error(`Unknown entity: ${name}. Add to ENTITY_TABLE_MAP in supabaseClient.js`);
  return mapped;
}

function createEntitiesProxy() {
  return new Proxy({}, {
    get(_, entityName) {
      const table = entityNameToTable(entityName);
      return {
        async list(orderBy, limit) {
          let q = supabase.from(table).select('*');
          if (orderBy) {
            const desc = orderBy.startsWith('-');
            const field = desc ? orderBy.slice(1) : orderBy;
            q = q.order(field, { ascending: !desc });
          }
          if (limit) q = q.limit(limit);
          const { data } = await q;
          return data || [];
        },
        async filter(criteria, orderBy, limit) {
          let q = supabase.from(table).select('*');
          for (const [k, v] of Object.entries(criteria || {})) {
            q = q.eq(k, v);
          }
          if (orderBy) {
            const desc = orderBy.startsWith('-');
            const field = desc ? orderBy.slice(1) : orderBy;
            q = q.order(field, { ascending: !desc });
          }
          if (limit) q = q.limit(limit);
          const { data } = await q;
          return data || [];
        },
        async create(data) {
          const { data: created } = await supabase.from(table).insert(data).select().single();
          return created;
        },
        async update(id, data) {
          const { data: updated } = await supabase.from(table).update(data).eq('id', id).select().single();
          return updated;
        },
        async delete(id) {
          await supabase.from(table).delete().eq('id', id);
        },
        async get(id) {
          const { data } = await supabase.from(table).select('*').eq('id', id).single();
          return data;
        },
      };
    },
  });
}