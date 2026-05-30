// Abandoned cart reminder — incomplete subscriptions 2-24h old
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdminOrScheduled } from '../_shared/authGuards.ts';
import { sendEmail } from '../_shared/resend.ts';

const APP_URL = Deno.env.get('APP_URL') || 'https://ceriakid.com';
const WHATSAPP_URL = 'https://wa.me/60177844120?text=' + encodeURIComponent('Salam, saya nak teruskan pembelian CeriaKid');
const TIER_LABEL: Record<string, string> = {
  asas: 'Asas (RM49/tahun)',
  standard: 'Standard (RM99/tahun)',
  keluarga: 'Keluarga (RM199/tahun)',
};

function buildEmail(tier: string) {
  const tierName = TIER_LABEL[tier] || tier;
  return {
    subject: `🎁 Anak anda tunggu — habiskan pendaftaran CeriaKid?`,
    html: `<!DOCTYPE html><html><body style="margin:0;font-family:sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:32px 24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;">🎓 Anak anda tunggu!</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.95);">Pendaftaran ${tierName} belum siap</p></td></tr>
<tr><td style="padding:28px 24px;"><p>Hai! 👋</p>
<p style="color:#475569;">Anda mula daftar pelan <strong>${tierName}</strong> tapi belum siap. Klik untuk teruskan:</p></td></tr>
<tr><td style="padding:0 24px 20px;text-align:center;">
<a href="${APP_URL}/#pricing" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;">🚀 Sambung Pendaftaran</a></td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;">
<p style="color:#64748b;font-size:13px;">Ada soalan? WhatsApp:</p>
<a href="${WHATSAPP_URL}" style="display:inline-block;padding:10px 20px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;">💬 017-784 4120</a></td></tr>
</table></td></tr></table></body></html>`,
  };
}

Deno.serve(async (req) => {
  const guard = await requireAdminOrScheduled(req);
  if (guard instanceof Response) return guard;

  try {
    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

    const { data: subs } = await supabaseAdmin
      .from('ck_user_subscriptions')
      .select('*')
      .eq('status', 'incomplete')
      .eq('abandoned_reminder_sent', false)
      .gte('updated_at', oneDayAgo)
      .lte('updated_at', twoHoursAgo);

    let sent = 0, failed = 0;

    for (const sub of subs || []) {
      if (!sub.email || !sub.tier || sub.tier === 'free') continue;
      const content = buildEmail(sub.tier);
      const result = await sendEmail({ to: sub.email, subject: content.subject, html: content.html });
      const nowIso = new Date().toISOString();

      if (result.ok) {
        await supabaseAdmin.from('ck_user_subscriptions').update({
          abandoned_reminder_sent: true,
          abandoned_reminder_status: 'sent',
          abandoned_reminder_sent_at: nowIso,
          abandoned_reminder_message_id: result.id,
        }).eq('id', sub.id);
        sent++;
      } else {
        await supabaseAdmin.from('ck_user_subscriptions').update({
          abandoned_reminder_sent: true,
          abandoned_reminder_status: 'failed',
          abandoned_reminder_sent_at: nowIso,
          abandoned_reminder_error: result.error?.substring(0, 500),
        }).eq('id', sub.id);
        failed++;
      }
    }

    return jsonResponse({ sent, failed, total: subs?.length || 0 });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});