// Low credit reminder — users baki < 5, paid sub, 14-day cooldown
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdminOrScheduled } from '../_shared/authGuards.ts';
import { sendEmail } from '../_shared/resend.ts';

const APP_URL = Deno.env.get('APP_URL') || 'https://ceriakid.com';
const LOW_THRESHOLD = 5;
const COOLDOWN_DAYS = 14;

function buildEmail(balance: number) {
  return {
    subject: `💰 Kredit AI anda tinggal ${balance} sahaja!`,
    html: `<!DOCTYPE html><html><body style="margin:0;font-family:sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:28px 24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;">⚠️ Kredit Hampir Habis!</h1>
<p style="margin:8px 0 0;color:#fff;">Baki: <strong>${balance} kredit</strong></p></td></tr>
<tr><td style="padding:24px;"><p>Hai! 👋</p>
<p style="color:#475569;">Baki kredit AI anda dah <strong>tinggal ${balance}</strong>. Top up sekarang.</p>
<ul style="color:#475569;"><li>💬 Cikgu Firdaus — Tutor AI</li>
<li>📝 Cikgu Rosie — Kuiz custom</li>
<li>📚 Cikgu Mira — Cerita pengajaran</li>
<li>🎨 Cikgu Daniel — BBM</li></ul></td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;">
<a href="${APP_URL}/buy-credits" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;">🚀 Top Up Sekarang</a></td></tr>
</table></td></tr></table></body></html>`,
  };
}

Deno.serve(async (req) => {
  const guard = await requireAdminOrScheduled(req);
  if (guard instanceof Response) return guard;

  try {
    // Get low-credit users
    const { data: lowCreditUsers } = await supabaseAdmin
      .from('ck_user_credits')
      .select('*')
      .lte('balance', LOW_THRESHOLD);

    // Get active paid sub emails
    const { data: subs } = await supabaseAdmin
      .from('ck_user_subscriptions')
      .select('email, tier, status');
    const activePaidEmails = new Set(
      (subs || []).filter(s => s.status === 'active' && s.tier && s.tier !== 'free').map(s => s.email)
    );

    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let sent = 0, skipped = 0;

    for (const credit of lowCreditUsers || []) {
      if (!activePaidEmails.has(credit.user_email)) { skipped++; continue; }
      if ((credit.total_purchased || 0) === 0 && (credit.total_used || 0) < 3) { skipped++; continue; }

      // Check cooldown
      const { data: recentReminders } = await supabaseAdmin
        .from('ck_credit_transactions')
        .select('created_at, metadata')
        .eq('user_email', credit.user_email)
        .eq('type', 'admin_adjustment')
        .eq('feature', 'admin')
        .order('created_at', { ascending: false })
        .limit(50);

      const lastReminder = (recentReminders || []).find((t: any) => t.metadata?.kind === 'low_credit_reminder');
      if (lastReminder && now - new Date(lastReminder.created_at).getTime() < cooldownMs) {
        skipped++;
        continue;
      }

      const content = buildEmail(credit.balance || 0);
      const r = await sendEmail({ to: credit.user_email, subject: content.subject, html: content.html });
      if (!r.ok) continue;

      // Log marker
      await supabaseAdmin.from('ck_credit_transactions').insert({
        user_email: credit.user_email,
        type: 'admin_adjustment',
        amount: 0,
        balance_after: credit.balance || 0,
        feature: 'admin',
        description: `Reminder kredit rendah (baki ${credit.balance})`,
        metadata: { kind: 'low_credit_reminder', sentAt: new Date().toISOString() },
      });
      sent++;
    }

    return jsonResponse({ success: true, totalLowBalance: lowCreditUsers?.length || 0, sent, skipped });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});