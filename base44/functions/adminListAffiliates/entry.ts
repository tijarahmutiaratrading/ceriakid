import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Admin: ambil semua data affiliate untuk dashboard
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const [affiliates, referrals, payouts] = await Promise.all([
      base44.asServiceRole.entities.Affiliate.list('-created_date', 500),
      base44.asServiceRole.entities.AffiliateReferral.list('-created_date', 500),
      base44.asServiceRole.entities.AffiliatePayout.list('-created_date', 200),
    ]);

    // Totals
    const totalAffiliates = affiliates.length;
    const totalActiveAffiliates = affiliates.filter(a => a.status === 'active').length;
    const totalCommissionPaid = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amountMYR || 0), 0);
    const totalCommissionPending = affiliates.reduce((s, a) => s + (a.pendingBalance || 0), 0);
    const pendingPayouts = payouts.filter(p => p.status === 'requested').length;

    return Response.json({
      affiliates,
      referrals,
      payouts,
      stats: {
        totalAffiliates,
        totalActiveAffiliates,
        totalCommissionPaid,
        totalCommissionPending,
        pendingPayouts,
      },
    });
  } catch (error) {
    console.error('adminListAffiliates error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});