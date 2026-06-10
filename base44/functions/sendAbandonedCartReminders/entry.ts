import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Hantar reminder email kepada user yang start checkout tapi tak siap bayar.
// Trigger: subscription status='incomplete' yang dah lebih 10 minit tapi belum 24 jam.
// Maksimum 1 reminder per user — tracking via `abandonedReminderSent` flag.
//
// Tracking detail dalam database (untuk admin dashboard):
//   - abandonedReminderStatus: 'not_sent' → 'sent' / 'failed' → 'recovered' (kalau user bayar selepas itu)
//   - abandonedReminderSentAt: timestamp ISO
//   - abandonedReminderMessageId: Resend message ID
//   - abandonedReminderError: error message kalau gagal

const APP_URL = 'https://ceriakid.com';
const WHATSAPP_URL = 'https://wa.me/60177844120?text=' + encodeURIComponent('Salam, saya nak teruskan pembelian CeriaKid');
const TIER_LABEL = { asas: 'Asas (RM49/tahun)', standard: 'Standard (RM99/tahun)', keluarga: 'Keluarga (RM199/tahun)' };

function buildEmail(tier) {
  const tierName = TIER_LABEL[tier] || tier;
  return {
    subject: `🎁 Anak anda tunggu — habiskan pendaftaran CeriaKid?`,
    html: `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;background:#f8fafc"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
<tr><td style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:32px 24px;text-align:center">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:900">🎓 Anak anda tunggu!</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.95);font-size:14px">Pendaftaran ${tierName} anda belum siap</p></td></tr>
<tr><td style="padding:28px 24px"><p style="margin:0 0 16px;color:#1e293b;font-size:16px">Hai! 👋</p>
<p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">Kami perasan anda mula daftar pelan <strong>${tierName}</strong> tapi belum siap. Tak lama je — klik bawah untuk teruskan pembayaran:</p></td></tr>
<tr><td style="padding:0 24px 20px;text-align:center"><a href="${APP_URL}/#pricing" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:15px">🚀 Sambung Pendaftaran</a></td></tr>
<tr><td style="padding:0 24px 24px"><div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:14px"><p style="margin:0;color:#166534;font-size:13px;font-weight:700">💡 Kenapa ibu bapa pilih CeriaKid?</p>
<p style="margin:6px 0 0;color:#15803d;font-size:13px;line-height:1.6">✅ Tanpa iklan • ✅ Ikut KSPK/KSSR • ✅ Dashboard untuk pantau anak • ✅ Boleh guna offline</p></div></td></tr>
<tr><td style="padding:0 24px 24px;text-align:center"><p style="margin:0 0 10px;color:#64748b;font-size:13px">Ada soalan? Hubungi kami terus:</p>
<a href="${WHATSAPP_URL}" style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:14px"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="18" height="18" alt="WhatsApp" style="vertical-align:middle;margin-right:8px" />WhatsApp</a></td></tr>
<tr><td style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0"><p style="margin:0;color:#94a3b8;font-size:11px">© CeriaKid</p></td></tr>
</table></td></tr></table></body></html>`,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled trigger OR admin manual trigger
    let isScheduled = false;
    try {
      const payload = await req.clone().json();
      if (payload?.automation?.type === 'scheduled') isScheduled = true;
    } catch { /* not scheduled */ }

    if (!isScheduled) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
      return Response.json({ error: 'Resend not configured' }, { status: 500 });
    }

    // Cari semua subscription status='incomplete', umur 2-24 jam, belum dapat reminder
    const subs = await base44.asServiceRole.entities.UserSubscription.filter({ status: 'incomplete' });
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    let sent = 0, failed = 0, skipped = 0;
    const from = RESEND_FROM_EMAIL.includes('<') ? RESEND_FROM_EMAIL : `CeriaKid <${RESEND_FROM_EMAIL}>`;

    for (const sub of subs) {
      if (sub.abandonedReminderSent) { skipped++; continue; }
      if (!sub.email || !sub.tier || sub.tier === 'free') { skipped++; continue; }
      const updated = sub.updated_date ? new Date(sub.updated_date).getTime() : 0;
      if (updated > tenMinutesAgo || updated < oneDayAgo) { skipped++; continue; }

      const content = buildEmail(sub.tier);
      const nowIso = new Date().toISOString();
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to: sub.email, subject: content.subject, html: content.html }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.id) {
          await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
            abandonedReminderSent: true,
            abandonedReminderStatus: 'sent',
            abandonedReminderSentAt: nowIso,
            abandonedReminderMessageId: data.id,
            abandonedReminderError: '',
          });
          sent++;
          console.log(`✅ Abandoned cart reminder sent: ${sub.email} (tier=${sub.tier}, msgId=${data.id})`);
        } else {
          const errMsg = data?.message || data?.error || `HTTP ${res.status}`;
          await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
            abandonedReminderSent: true, // tandai sent supaya tak retry berulang kali
            abandonedReminderStatus: 'failed',
            abandonedReminderSentAt: nowIso,
            abandonedReminderError: String(errMsg).substring(0, 500),
          });
          failed++;
          console.error(`❌ Failed to send to ${sub.email}: ${errMsg}`);
        }
      } catch (err) {
        await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
          abandonedReminderSent: true,
          abandonedReminderStatus: 'failed',
          abandonedReminderSentAt: nowIso,
          abandonedReminderError: String(err?.message || err).substring(0, 500),
        });
        failed++;
        console.error(`❌ Exception sending to ${sub.email}:`, err?.message || err);
      }
    }

    console.log(`Abandoned cart job done — sent: ${sent}, failed: ${failed}, skipped: ${skipped}, total: ${subs.length}`);
    return Response.json({ sent, failed, skipped, total: subs.length });
  } catch (error) {
    console.error('sendAbandonedCartReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});