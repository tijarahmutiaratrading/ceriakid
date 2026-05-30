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

// Convert PascalCase entity name → snake_case with ck_ prefix
// e.g. "UserSubscription" → "ck_user_subscriptions"
function entityNameToTable(name) {
  const snake = name.replace(/[A-Z]/g, (m, i) => (i === 0 ? '' : '_') + m.toLowerCase());
  // Pluralize: add 's' (simple — handle edge cases manually)
  const pluralMap = {
    user: 'users',
    user_subscription: 'user_subscriptions',
    user_credit: 'user_credits',
    credit_transaction: 'credit_transactions',
    affiliate: 'affiliates',
    affiliate_referral: 'affiliate_referrals',
    affiliate_payout: 'affiliate_payouts',
    game: 'games',
    a_i_story: 'ai_stories',
    b_b_m_resource: 'bbm_resources',
    push_subscription: 'push_subscriptions',
    chat_conversation: 'chat_conversations',
    quiz_history: 'quiz_history',
    registered_device: 'registered_devices',
    child_game_progress: 'child_game_progress',
    leaderboard: 'leaderboards',
    achievement: 'achievements',
    daily_challenge: 'daily_challenges',
    friend: 'friends',
    friend_challenge: 'friend_challenges',
    game_task: 'game_tasks',
    q_c_log: 'qc_logs',
    q_c_setting: 'qc_settings',
    health_check_log: 'health_check_logs',
    monthly_gen_setting: 'monthly_gen_settings',
    subscription_tier: 'subscription_tiers',
  };
  const base = pluralMap[snake] || `${snake}s`;
  return `ck_${base}`;
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