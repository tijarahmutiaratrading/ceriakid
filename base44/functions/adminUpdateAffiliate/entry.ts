import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Admin: update commission rates / status affiliate
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { affiliateId, status, commissionRateSubscription, commissionRateCredit } = await req.json();
    if (!affiliateId) return Response.json({ error: 'Missing affiliateId' }, { status: 400 });

    const update = {};
    if (status !== undefined) update.status = status;
    if (commissionRateSubscription !== undefined) update.commissionRateSubscription = Number(commissionRateSubscription);
    if (commissionRateCredit !== undefined) update.commissionRateCredit = Number(commissionRateCredit);

    await base44.asServiceRole.entities.Affiliate.update(affiliateId, update);

    return Response.json({ success: true });
  } catch (error) {
    console.error('adminUpdateAffiliate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});