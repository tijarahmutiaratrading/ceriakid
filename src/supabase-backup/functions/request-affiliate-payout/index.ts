// Affiliate requests payout withdrawal (min RM50)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireUser } from '../_shared/authGuards.ts';
import { sendEmail } from '../_shared/resend.ts';

const MIN_PAYOUT_MYR = 50;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireUser(req);
  if (guard instanceof Response) return guard;
  const { user } = guard;

  try {
    const { data: affs } = await supabaseAdmin
      .from('ck_affiliates')
      .select('*')
      .eq('user_email', user.email);

    if (!affs || affs.length === 0) return jsonResponse({ error: 'Bukan affiliate' }, 404);
    const affiliate = affs[0];
    const balance = affiliate.pending_balance || 0;

    if (balance < MIN_PAYOUT_MYR) {
      return jsonResponse({ error: `Baki minimum withdraw RM${MIN_PAYOUT_MYR}` }, 400);
    }
    if (!affiliate.bank_name || !affiliate.bank_account_number || !affiliate.bank_account_holder) {
      return jsonResponse({ error: 'Sila lengkapkan maklumat bank dahulu' }, 400);
    }

    // Check pending payout
    const { data: existing } = await supabaseAdmin
      .from('ck_affiliate_payouts')
      .select('id')
      .eq('affiliate_email', user.email)
      .eq('status', 'requested');

    if (existing && existing.length > 0) {
      return jsonResponse({ error: 'Anda sudah ada permintaan payout pending' }, 400);
    }

    // Get approved referrals count
    const { data: approvedRefs } = await supabaseAdmin
      .from('ck_affiliate_referrals')
      .select('id')
      .eq('affiliate_email', user.email)
      .eq('status', 'approved');

    const { data: payout } = await supabaseAdmin
      .from('ck_affiliate_payouts')
      .insert({
        affiliate_email: user.email,
        amount_myr: balance,
        status: 'requested',
        bank_name: affiliate.bank_name,
        bank_account_number: affiliate.bank_account_number,
        bank_account_holder: affiliate.bank_account_holder,
        requested_at: new Date().toISOString(),
        referral_count: approvedRefs?.length || 0,
      })
      .select()
      .single();

    // Reset pending balance
    await supabaseAdmin.from('ck_affiliates').update({ pending_balance: 0 }).eq('id', affiliate.id);

    // Notify admins via email (best-effort)
    try {
      const { data: admins } = await supabaseAdmin
        .from('ck_users')
        .select('email')
        .eq('role', 'admin');

      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;">
<div style="background:#fff;padding:32px;border-radius:12px;">
<h2 style="color:#7c3aed;margin:0 0 16px;">💰 Permintaan Payout Affiliate Baru</h2>
<table style="width:100%;margin-top:20px;font-size:14px;">
<tr><td style="padding:8px 0;color:#6b7280;">Affiliate</td><td style="font-weight:600;">${affiliate.full_name || user.email}</td></tr>
<tr><td style="padding:8px 0;color:#6b7280;">Email</td><td>${user.email}</td></tr>
<tr><td style="padding:8px 0;color:#6b7280;">Jumlah</td><td style="font-weight:700;color:#059669;font-size:18px;">RM ${balance.toFixed(2)}</td></tr>
<tr><td style="padding:8px 0;color:#6b7280;">Bank</td><td>${affiliate.bank_name}</td></tr>
<tr><td style="padding:8px 0;color:#6b7280;">No. Akaun</td><td style="font-family:monospace;">${affiliate.bank_account_number}</td></tr>
<tr><td style="padding:8px 0;color:#6b7280;">Pemegang</td><td>${affiliate.bank_account_holder}</td></tr>
</table>
<a href="https://ceriakid.com/admin-dashboard" style="display:inline-block;margin-top:24px;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Buka Admin Dashboard →</a>
</div></div>`;

      await Promise.all((admins || []).map((a: any) =>
        sendEmail({
          to: a.email,
          subject: `💰 Payout Request: RM${balance.toFixed(2)} dari ${affiliate.full_name || user.email}`,
          html,
          fromName: 'CeriaKid Affiliate',
        })
      ));
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr);
    }

    return jsonResponse({ success: true, payout });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});