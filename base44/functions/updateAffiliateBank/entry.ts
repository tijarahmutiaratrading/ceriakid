import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Update maklumat bank affiliate
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { bankName, bankAccountNumber, bankAccountHolder, phone } = await req.json();

    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({ userEmail: user.email });
    if (affiliates.length === 0) {
      return Response.json({ error: 'Bukan affiliate' }, { status: 404 });
    }

    const update = {};
    if (bankName !== undefined) update.bankName = bankName;
    if (bankAccountNumber !== undefined) update.bankAccountNumber = bankAccountNumber;
    if (bankAccountHolder !== undefined) update.bankAccountHolder = bankAccountHolder;
    if (phone !== undefined) update.phone = phone;

    await base44.asServiceRole.entities.Affiliate.update(affiliates[0].id, update);

    return Response.json({ success: true });
  } catch (error) {
    console.error('updateAffiliateBank error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});