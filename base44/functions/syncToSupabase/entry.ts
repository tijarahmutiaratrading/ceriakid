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
      category: r.category,
      age_group: r.ageGroup,
      darjah: r.darjah || null,
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