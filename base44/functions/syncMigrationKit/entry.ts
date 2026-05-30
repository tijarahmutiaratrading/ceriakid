/**
 * syncMigrationKit — Auto-refresh Migration Kit live snapshot
 *
 * Purpose:
 * Generate a live snapshot of current app state (entities, functions, automations,
 * asset count, sync status) dan save ke Supabase table `ck_migration_snapshots`.
 *
 * Dipanggil bersama syncToSupabase + backupAllAssets bila admin tekan
 * "Sync Semua Sekarang" button.
 *
 * Output: { success, snapshot: { entities, functions, automations, assets, lastSync } }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const isScheduled = body.scheduled === true;

    if (!isScheduled) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
      }
    }

    // ── Gather live counts in parallel ──
    const [
      gameCount,
      bbmCount,
      storyCount,
      userCount,
      subCount,
      assetManifest,
    ] = await Promise.all([
      base44.asServiceRole.entities.Game.list('-created_date', 1).then(() => 'ok').catch(() => 'err'),
      base44.asServiceRole.entities.BBMResource.list('-created_date', 1).then(() => 'ok').catch(() => 'err'),
      base44.asServiceRole.entities.AIStory.list('-created_date', 1).then(() => 'ok').catch(() => 'err'),
      base44.asServiceRole.entities.User.list('-created_date', 1).then(() => 'ok').catch(() => 'err'),
      base44.asServiceRole.entities.UserSubscription.list('-created_date', 1).then(() => 'ok').catch(() => 'err'),
      // Asset count from mapping table
      fetch(`${SUPABASE_URL}/rest/v1/ck_asset_mapping?select=count`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'count=exact',
        },
      }).then(r => parseInt(r.headers.get('content-range')?.split('/')[1] || '0', 10)).catch(() => 0),
    ]);

    const snapshot = {
      generated_at: new Date().toISOString(),
      entities_health: {
        Game: gameCount,
        BBMResource: bbmCount,
        AIStory: storyCount,
        User: userCount,
        UserSubscription: subCount,
      },
      assets_backed_up: assetManifest,
      docs_version: '2026-05-30',
      kit_files: 22, // current migration kit doc count
      note: 'Auto-generated bila admin tekan "Sync Semua Sekarang" button',
    };

    // ── Save snapshot to Supabase (audit trail) ──
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/ck_migration_snapshots`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          generated_at: snapshot.generated_at,
          snapshot,
        }),
      });
    } catch (e) {
      console.warn('Snapshot save warning:', e.message);
    }

    return Response.json({ success: true, snapshot });
  } catch (error) {
    console.error('syncMigrationKit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});