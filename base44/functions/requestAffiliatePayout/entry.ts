import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MIN_PAYOUT_MYR = 50;

// Affiliate request untuk withdraw pending balance
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ userEmail: user.email });
    if (affiliates.length === 0) return Response.json({ error: 'Bukan affiliate' }, { status: 404 });

    const affiliate = affiliates[0];
    const balance = affiliate.pendingBalance || 0;

    if (balance < MIN_PAYOUT_MYR) {
      return Response.json({ error: `Baki minimum untuk withdraw ialah RM${MIN_PAYOUT_MYR}` }, { status: 400 });
    }

    if (!affiliate.bankName || !affiliate.bankAccountNumber || !affiliate.bankAccountHolder) {
      return Response.json({ error: 'Sila lengkapkan maklumat bank dahulu' }, { status: 400 });
    }

    // Check kalau dah ada payout pending
    const existing = await base44.asServiceRole.entities.AffiliatePayout.filter({
      affiliateEmail: user.email,
      status: 'requested',
    });
    if (existing.length > 0) {
      return Response.json({ error: 'Anda sudah ada permintaan payout yang menunggu' }, { status: 400 });
    }

    // Approved referrals (status='approved') yang belum dimasukkan dalam payout
    const approvedRefs = await base44.asServiceRole.entities.AffiliateReferral.filter({
      affiliateEmail: user.email,
      status: 'approved',
    });

    const payout = await base44.asServiceRole.entities.AffiliatePayout.create({
      affiliateEmail: user.email,
      amountMYR: balance,
      status: 'requested',
      bankName: affiliate.bankName,
      bankAccountNumber: affiliate.bankAccountNumber,
      bankAccountHolder: affiliate.bankAccountHolder,
      requestedAt: new Date().toISOString(),
      referralCount: approvedRefs.length,
    });

    // Reset pending balance
    await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
      pendingBalance: 0,
    });

    return Response.json({ success: true, payout });
  } catch (error) {
    console.error('requestAffiliatePayout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});