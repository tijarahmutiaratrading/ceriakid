import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Ambil profil affiliate user semasa + rujukan + payout history
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ userEmail: user.email });
    if (affiliates.length === 0) {
      return Response.json({ isAffiliate: false });
    }

    const affiliate = affiliates[0];

    const [referrals, payouts] = await Promise.all([
      base44.asServiceRole.entities.AffiliateReferral.filter({ affiliateEmail: user.email }, '-created_date', 100),
      base44.asServiceRole.entities.AffiliatePayout.filter({ affiliateEmail: user.email }, '-created_date', 50),
    ]);

    return Response.json({
      isAffiliate: true,
      affiliate,
      referrals,
      payouts,
    });
  } catch (error) {
    console.error('getAffiliateData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});