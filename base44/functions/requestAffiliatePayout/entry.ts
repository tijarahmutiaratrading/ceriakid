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

    // ─── Notify all admins via email (best-effort, tak blok response) ───
    try {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      const adminEmails = admins.map(a => a.email).filter(Boolean);

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb;">
          <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #7c3aed; margin: 0 0 16px;">💰 Permintaan Payout Affiliate Baru</h2>
            <p style="color: #374151; font-size: 15px;">Seorang affiliate telah memohon untuk withdraw komisen. Sila proses bank transfer dan tanda sebagai <b>Complete</b> di admin dashboard.</p>

            <table style="width: 100%; margin-top: 20px; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #6b7280;">Affiliate</td><td style="padding: 8px 0; font-weight: 600;">${affiliate.fullName || user.email}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;">${user.email}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Jumlah</td><td style="padding: 8px 0; font-weight: 700; color: #059669; font-size: 18px;">RM ${balance.toFixed(2)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Bilangan Rujukan</td><td style="padding: 8px 0;">${approvedRefs.length}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Bank</td><td style="padding: 8px 0;">${affiliate.bankName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">No. Akaun</td><td style="padding: 8px 0; font-family: monospace;">${affiliate.bankAccountNumber}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Nama Pemegang</td><td style="padding: 8px 0;">${affiliate.bankAccountHolder}</td></tr>
            </table>

            <a href="https://ceriakid.com/admin-dashboard" style="display: inline-block; margin-top: 24px; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Buka Admin Dashboard →</a>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Email automatik dari sistem CeriaKid Affiliate.</p>
          </div>
        </div>
      `;

      await Promise.all(adminEmails.map(adminEmail =>
        base44.asServiceRole.functions.invoke('sendResendEmail', {
          to: adminEmail,
          subject: `💰 Payout Request: RM${balance.toFixed(2)} dari ${affiliate.fullName || user.email}`,
          html,
          fromName: 'CeriaKid Affiliate',
        }).catch(e => console.error(`Failed to email admin ${adminEmail}:`, e))
      ));
    } catch (emailErr) {
      console.error('Admin notification email failed (non-fatal):', emailErr);
    }
    // ─── End admin notification ───

    return Response.json({ success: true, payout });
  } catch (error) {
    console.error('requestAffiliatePayout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});