import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Sync semua data CeriaKid dari Base44 ke Supabase.
 * Boleh dipanggil:
 *   - Manual oleh admin: base44.functions.invoke('syncToSupabase', {})
 *   - Scheduled automation (payload { scheduled: true })
 *
 * Strategi: UPSERT setiap row ke table Supabase yang sepadan (id = primary key).
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

// Map: Entity Base44 → table Supabase + cara extract kolum
const ENTITY_MAP = [
  {
    entity: 'User',
    table: 'ck_users',
    extract: (r) => ({
      id: r.id,
      email: r.email,
      full_name: r.full_name,
      role: r.role,
      created_date: r.created_date,
      data: r,
    }),
  },
  {
    entity: 'UserSubscription',
    table: 'ck_user_subscriptions',
    extract: (r) => ({
      id: r.id,
      email: r.email,
      tier: r.tier,
      status: r.status,
      current_period_end: r.currentPeriodEnd || null,
      data: r,
    }),
  },
  {
    entity: 'UserCredit',
    table: 'ck_user_credits',
    extract: (r) => ({
      id: r.id,
      user_email: r.userEmail,
      balance: r.balance ?? 0,
      total_purchased: r.totalPurchased ?? 0,
      total_used: r.totalUsed ?? 0,
      data: r,
    }),
  },
  {
    entity: 'CreditTransaction',
    table: 'ck_credit_transactions',
    extract: (r) => ({
      id: r.id,
      user_email: r.userEmail,
      type: r.type,
      amount: r.amount,
      feature: r.feature,
      created_date: r.created_date,
      data: r,
    }),
  },
  {
    entity: 'Game',
    table: 'ck_games',
    extract: (r) => ({
      id: r.id,
      title: r.title,
      description: r.description || null,
      type: r.type || null,
      category: r.category,
      age_group: r.ageGroup,
      darjah: r.darjah || null,
      difficulty: r.difficulty || null,
      tier: r.tier || 'free',
      emoji: r.emoji || null,
      total_questions: r.totalQuestions ?? null,
      is_published: r.isPublished ?? true,
      status: r.status || null,
      month_tag: r.monthTag || null,
      game_data: r.gameData || null,
      created_date: r.created_date || null,
      updated_date: r.updated_date || null,
      data: r,
    }),
  },
  {
    entity: 'AIStory',
    table: 'ck_ai_stories',
    extract: (r) => ({
      id: r.id,
      title: r.title,
      emoji: r.emoji || null,
      cover_image: r.coverImage || null,
      story: r.story || null,
      moral_summary: r.moralSummary || null,
      theme: r.theme || null,
      child_name: r.childName || null,
      age_range: r.ageRange || null,
      moral_lesson: r.moralLesson || null,
      length: r.length || null,
      created_by: r.created_by || null,
      created_date: r.created_date || null,
      data: r,
    }),
  },
  {
    entity: 'BBMResource',
    table: 'ck_bbm_resources',
    extract: (r) => ({
      id: r.id,
      title: r.title,
      description: r.description || null,
      subject: r.subject,
      level: r.level,
      type: r.type,
      file_url: r.fileUrl || null,
      html_content: r.htmlContent || null,
      preview_image_url: r.previewImageUrl || null,
      emoji: r.emoji || null,
      tags: r.tags || null,
      tier: r.tier || 'free',
      download_count: r.downloadCount ?? 0,
      is_published: r.isPublished ?? true,
      created_by: r.created_by || null,
      created_date: r.created_date || null,
      data: r,
    }),
  },
  {
    entity: 'ChildGameProgress',
    table: 'ck_child_game_progress',
    extract: (r) => ({
      id: r.id,
      user_email: r.userEmail,
      child_name: r.childName,
      category: r.category,
      best_stars: r.bestStars ?? 0,
      last_played_date: r.lastPlayedDate || null,
      data: r,
    }),
  },
  {
    entity: 'Leaderboard',
    table: 'ck_leaderboard',
    extract: (r) => ({
      id: r.id,
      user_email: r.userEmail,
      child_name: r.childName,
      total_stars: r.totalStars ?? 0,
      games_completed: r.gamesCompleted ?? 0,
      data: r,
    }),
  },
  {
    entity: 'Achievement',
    table: 'ck_achievements',
    extract: (r) => ({
      id: r.id,
      user_email: r.userEmail,
      badge_id: r.badgeId,
      unlocked_date: r.unlockedDate || null,
      data: r,
    }),
  },
  {
    entity: 'PushSubscription',
    table: 'ck_push_subscriptions',
    extract: (r) => ({
      id: r.id,
      user_email: r.userEmail,
      endpoint: r.endpoint,
      is_admin: r.isAdmin ?? false,
      created_date: r.created_date || null,
      data: r,
    }),
  },
  {
    entity: 'ChatConversation',
    table: 'ck_chat_conversations',
    extract: (r) => ({
      id: r.id,
      title: r.title,
      agent: r.agent || null,
      subject: r.subject || null,
      level: r.level || null,
      message_count: r.messageCount ?? 0,
      last_message_at: r.lastMessageAt || null,
      created_by: r.created_by || null,
      created_date: r.created_date || null,
      data: r,
    }),
  },
  {
    entity: 'QuizHistory',
    table: 'ck_quiz_history',
    extract: (r) => ({
      id: r.id,
      question: r.question,
      is_correct: r.isCorrect ?? false,
      subject: r.subject || null,
      level: r.level || null,
      difficulty: r.difficulty || null,
      topic: r.topic || null,
      created_by: r.created_by || null,
      created_date: r.created_date || null,
      data: r,
    }),
  },
  {
    entity: 'RegisteredDevice',
    table: 'ck_registered_devices',
    extract: (r) => ({
      id: r.id,
      user_email: r.userEmail,
      device_id: r.deviceId,
      device_name: r.deviceName,
      last_seen: r.lastSeen || null,
      data: r,
    }),
  },
  {
    entity: 'SubscriptionTier',
    table: 'ck_subscription_tiers',
    extract: (r) => ({
      id: r.id,
      name: r.name,
      price_myr: r.priceMYR ?? null,
      price_usd: r.priceUSD ?? null,
      data: r,
    }),
  },
  {
    entity: 'DailyChallenge',
    table: 'ck_daily_challenges',
    extract: (r) => ({
      id: r.id,
      challenge_date: r.challengeDate || null,
      game_category: r.gameCategory,
      age_group: r.ageGroup,
      data: r,
    }),
  },
  {
    entity: 'Friend',
    table: 'ck_friends',
    extract: (r) => ({
      id: r.id,
      user_email: r.userEmail,
      friend_email: r.friendEmail,
      status: r.status || null,
      invite_code: r.inviteCode,
      data: r,
    }),
  },
  {
    entity: 'FriendChallenge',
    table: 'ck_friend_challenges',
    extract: (r) => ({
      id: r.id,
      challenge_id: r.challengeId,
      created_by: r.createdBy,
      opponent: r.opponent,
      game_category: r.gameCategory,
      status: r.status || null,
      data: r,
    }),
  },
  {
    entity: 'GameTask',
    table: 'ck_game_tasks',
    extract: (r) => ({
      id: r.id,
      task_name: r.taskName,
      age_group: r.ageGroup,
      subject: r.subject,
      status: r.status || null,
      data: r,
    }),
  },
  {
    entity: 'QCLog',
    table: 'ck_qc_logs',
    extract: (r) => ({
      id: r.id,
      run_at: r.runAt || null,
      action: r.action || null,
      status: r.status || null,
      score: r.score ?? null,
      data: r,
    }),
  },
  {
    entity: 'QCSetting',
    table: 'ck_qc_settings',
    extract: (r) => ({
      id: r.id,
      interval_minutes: r.intervalMinutes ?? null,
      data: r,
    }),
  },
  {
    entity: 'MonthlyGenSetting',
    table: 'ck_monthly_gen_settings',
    extract: (r) => ({
      id: r.id,
      data: r,
    }),
  },
  {
    entity: 'HealthCheckLog',
    table: 'ck_health_check_logs',
    extract: (r) => ({
      id: r.id,
      created_date: r.created_date || null,
      data: r,
    }),
  },
  {
    entity: 'Affiliate',
    table: 'ck_affiliates',
    extract: (r) => ({
      id: r.id,
      created_by: r.created_by || null,
      created_date: r.created_date || null,
      data: r,
    }),
  },
  {
    entity: 'AffiliateReferral',
    table: 'ck_affiliate_referrals',
    extract: (r) => ({
      id: r.id,
      created_date: r.created_date || null,
      data: r,
    }),
  },
  {
    entity: 'AffiliatePayout',
    table: 'ck_affiliate_payouts',
    extract: (r) => ({
      id: r.id,
      created_date: r.created_date || null,
      data: r,
    }),
  },
];

// Upsert batch ke Supabase via REST API
async function upsertBatch(table, rows) {
  if (!rows.length) return { count: 0 };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=id`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase ${table} (${res.status}): ${errText.slice(0, 300)}`);
  }
  return { count: rows.length };
}

// List semua records untuk satu entity dengan pagination
async function listAllRecords(base44, entityName, batchSize = 500) {
  const all = [];
  let skip = 0;
  // Hadkan kepada 50 batches (25k records) untuk elak run terlalu lama
  for (let i = 0; i < 50; i++) {
    const batch = await base44.asServiceRole.entities[entityName].list(
      '-created_date',
      batchSize,
      skip
    );
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < batchSize) break;
    skip += batchSize;
  }
  return all;
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return Response.json(
        { error: 'SUPABASE_URL or SUPABASE_SERVICE_KEY not configured' },
        { status: 500 }
      );
    }

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const isScheduled = body.scheduled === true;

    // Admin-only kecuali jika dicetuskan automation
    if (!isScheduled) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json(
          { error: 'Forbidden: Admin only' },
          { status: 403 }
        );
      }
    }

    const results = {};
    let totalRecords = 0;

    for (const { entity, table, extract } of ENTITY_MAP) {
      try {
        const records = await listAllRecords(base44, entity);
        const rows = records.map(extract);

        // Push ke Supabase dalam chunks 500 supaya tak overflow request body
        const CHUNK = 500;
        let pushed = 0;
        for (let i = 0; i < rows.length; i += CHUNK) {
          const slice = rows.slice(i, i + CHUNK);
          const r = await upsertBatch(table, slice);
          pushed += r.count;
        }

        results[entity] = { synced: pushed, total: records.length };
        totalRecords += pushed;
      } catch (e) {
        results[entity] = { error: e.message };
        console.error(`Sync failed for ${entity}:`, e.message);
      }
    }

    const durationMs = Date.now() - startTime;
    const hasErrors = Object.values(results).some((r) => r.error);
    const status = hasErrors ? 'partial' : 'success';

    // Log ke Supabase
    try {
      await upsertBatch('ck_sync_log', [
        {
          run_at: new Date().toISOString(),
          status,
          entities_synced: results,
          total_records: totalRecords,
          duration_ms: durationMs,
          error_message: hasErrors
            ? Object.entries(results)
                .filter(([, v]) => v.error)
                .map(([k, v]) => `${k}: ${v.error}`)
                .join('; ')
            : null,
        },
      ]);
    } catch (logErr) {
      console.error('Failed to log sync run:', logErr.message);
    }

    return Response.json({
      success: !hasErrors,
      status,
      totalRecords,
      durationMs,
      results,
    });
  } catch (error) {
    console.error('syncToSupabase fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});