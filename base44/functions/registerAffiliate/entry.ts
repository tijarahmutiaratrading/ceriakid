import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Daftar pengguna sebagai affiliate. Generate referral code unik secara automatik.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fullName, phone, bankName, bankAccountNumber, bankAccountHolder } = await req.json();

    if (!fullName || !phone) {
      return Response.json({ error: 'Sila lengkapkan nama dan telefon' }, { status: 400 });
    }

    // Check kalau dah ada
    const existing = await base44.asServiceRole.entities.Affiliate.filter({ userEmail: user.email });
    if (existing.length > 0) {
      return Response.json({ error: 'Anda sudah menjadi affiliate', affiliate: existing[0] }, { status: 400 });
    }

    // Generate kod unik berdasarkan nama
    const baseName = (fullName.split(' ')[0] || 'user').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6) || 'USER';
    let code = '';
    for (let i = 0; i < 10; i++) {
      const candidate = `${baseName}${Math.floor(1000 + Math.random() * 9000)}`;
      const dupe = await base44.asServiceRole.entities.Affiliate.filter({ referralCode: candidate });
      if (dupe.length === 0) {
        code = candidate;
        break;
      }
    }
    if (!code) code = `REF${Date.now().toString().slice(-8)}`;

    const created = await base44.asServiceRole.entities.Affiliate.create({
      userEmail: user.email,
      fullName,
      phone,
      referralCode: code,
      status: 'active',
      commissionRateSubscription: 20,
      commissionRateCredit: 15,
      totalReferrals: 0,
      totalEarned: 0,
      totalPaidOut: 0,
      pendingBalance: 0,
      bankName: bankName || '',
      bankAccountNumber: bankAccountNumber || '',
      bankAccountHolder: bankAccountHolder || '',
      joinedAt: new Date().toISOString(),
    });

    return Response.json({ success: true, affiliate: created });
  } catch (error) {
    console.error('registerAffiliate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});