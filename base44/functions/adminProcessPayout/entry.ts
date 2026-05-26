import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Admin: approve / reject / complete payout
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { payoutId, action, transactionRef, adminNote } = await req.json();
    if (!payoutId || !action) return Response.json({ error: 'Missing fields' }, { status: 400 });

    const payout = await base44.asServiceRole.entities.AffiliatePayout.filter({ id: payoutId });
    if (payout.length === 0) return Response.json({ error: 'Payout tidak dijumpai' }, { status: 404 });
    const p = payout[0];

    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ userEmail: p.affiliateEmail });
    const affiliate = affiliates[0];

    if (action === 'complete') {
      await base44.asServiceRole.entities.AffiliatePayout.update(p.id, {
        status: 'completed',
        processedAt: new Date().toISOString(),
        transactionRef: transactionRef || '',
        adminNote: adminNote || '',
      });

      // Update affiliate totalPaidOut
      if (affiliate) {
        await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
          totalPaidOut: (affiliate.totalPaidOut || 0) + (p.amountMYR || 0),
        });
      }

      // Mark all approved referrals as paid
      const approved = await base44.asServiceRole.entities.AffiliateReferral.filter({
        affiliateEmail: p.affiliateEmail,
        status: 'approved',
      });
      for (const ref of approved) {
        await base44.asServiceRole.entities.AffiliateReferral.update(ref.id, {
          status: 'paid',
          payoutId: p.id,
        });
      }
    } else if (action === 'reject') {
      await base44.asServiceRole.entities.AffiliatePayout.update(p.id, {
        status: 'rejected',
        processedAt: new Date().toISOString(),
        adminNote: adminNote || '',
      });
      // Refund pending balance
      if (affiliate) {
        await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
          pendingBalance: (affiliate.pendingBalance || 0) + (p.amountMYR || 0),
        });
      }
    } else if (action === 'processing') {
      await base44.asServiceRole.entities.AffiliatePayout.update(p.id, {
        status: 'processing',
        adminNote: adminNote || '',
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('adminProcessPayout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});