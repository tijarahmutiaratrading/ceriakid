// Auto-cleanup: incomplete subscriptions > 1h
// Runs every 30 min (scheduled)
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (_req) => {
  try {
    const cutoffIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: stuckSubs } = await supabaseAdmin
      .from('ck_user_subscriptions')
      .select('*')
      .eq('status', 'incomplete')
      .lt('updated_at', cutoffIso);

    let cleaned = 0;
    const now = Date.now();

    for (const sub of stuckSubs || []) {
      const periodEnd = sub.current_period_end ? new Date(sub.current_period_end).getTime() : 0;
      const stillActive = periodEnd > now;

      const updateData = stillActive
        ? { status: 'active' }
        : { status: 'canceled', tier: 'free' };

      await supabaseAdmin.from('ck_user_subscriptions').update(updateData).eq('id', sub.id);
      cleaned++;
    }

    return jsonResponse({ success: true, cleaned, message: `Cleaned ${cleaned} stuck subscriptions` });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});