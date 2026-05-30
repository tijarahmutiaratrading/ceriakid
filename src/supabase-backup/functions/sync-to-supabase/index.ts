// NOTE: Dalam Supabase, sync-to-supabase TIDAK DIPERLUKAN
// sebab Supabase ADALAH database utama — tiada lagi Base44 source.
//
// Function ini disimpan untuk compatibility dengan automations existing,
// tapi hanya log "no-op" dan return success.
//
// Kalau migrate balik ke Base44 (reverse sync), buat function berasingan.
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (_req) => {
  try {
    await supabaseAdmin.from('ck_sync_log').insert({
      run_at: new Date().toISOString(),
      status: 'success',
      total_records: 0,
      duration_ms: 0,
      entities_synced: { note: 'Supabase is now source of truth — sync is no-op' },
    });

    return jsonResponse({
      success: true,
      status: 'noop',
      message: 'Supabase is now source of truth. Sync skipped.',
      totalRecords: 0,
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});