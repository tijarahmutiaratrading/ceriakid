// Admin: list all affiliates + referrals + payouts + stats
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const [affsRes, refsRes, payoutsRes] = await Promise.all([
      supabaseAdmin.from('ck_affiliates').select('*').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('ck_affiliate_referrals').select('*').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('ck_affiliate_payouts').select('*').order('created_at', { ascending: false }).limit(200),
    ]);

    const affiliates = affsRes.data || [];
    const referrals = refsRes.data || [];
    const payouts = payoutsRes.data || [];

    const stats = {
      totalAffiliates: affiliates.length,
      totalActiveAffiliates: affiliates.filter((a: any) => a.status === 'active').length,
      totalCommissionPaid: payouts.filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + (p.amount_myr || 0), 0),
      totalCommissionPending: affiliates.reduce((s: number, a: any) => s + (a.pending_balance || 0), 0),
      pendingPayouts: payouts.filter((p: any) => p.status === 'requested').length,
    };

    return jsonResponse({ affiliates, referrals, payouts, stats });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});