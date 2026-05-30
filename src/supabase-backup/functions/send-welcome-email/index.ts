// ─────────────────────────────────────────────────────
// SEND WELCOME EMAIL — Resend integration (Supabase Edge)
// Public function (called server-to-server from webhook)
// ─────────────────────────────────────────────────────
import { jsonResponse } from '../_shared/cors.ts';

const APP_URL = Deno.env.get('APP_URL') || 'https://ceriakid.com';
const WHATSAPP_URL = 'https://wa.me/60177844120?text=' + encodeURIComponent('Salam, saya perlukan bantuan.');

const TIER_LABEL: Record<string, string> = { asas: 'Asas', standard: 'Standard', keluarga: 'Keluarga' };

function buildSubscriptionEmail(tier: string, bonusCredits: number) {
  const tierName = TIER_LABEL[tier] || tier;
  const bonusLine = bonusCredits > 0
    ? `<p style="margin:0 0 12px;color:#475569"><strong>🎁 Bonus selamat datang:</strong> Anda dapat <strong>${bonusCredits} kredit AI percuma</strong>!</p>`
    : '';

  return {
    subject: `🎉 Selamat datang ke CeriaKid — Pelan ${tierName} anda dah aktif!`,
    html: `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:32px 24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">🎉 Tahniah!</h1>
<p style="margin:8px 0 0;color:#fff;font-size:16px;">Pelan <strong>${tierName}</strong> anda dah aktif</p></td></tr>
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 16px;">Hai! 👋</p>
<p style="margin:0 0 16px;color:#475569;">Terima kasih sebab langgan CeriaKid. Subscription anda dah aktif untuk <strong>1 tahun penuh</strong>.</p>
${bonusLine}</td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;">
<a href="${APP_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;">🚀 Daftar / Login Sekarang</a>
</td></tr>
<tr><td style="padding:0 24px 28px;text-align:center;">
<p style="margin:0 0 12px;color:#64748b;font-size:14px;">Ada soalan? WhatsApp kami!</p>
<a href="${WHATSAPP_URL}" style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;">💬 WhatsApp</a></td></tr>
<tr><td style="background:#f8fafc;padding:20px 24px;text-align:center;">
<p style="margin:0;color:#94a3b8;font-size:12px;">© CeriaKid</p></td></tr>
</table></td></tr></table></body></html>`,
  };
}

function buildCreditEmail(credits: number) {
  return {
    subject: `💰 ${credits} kredit AI dah masuk akaun anda!`,
    html: `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px 24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">💰 Kredit Dah Masuk!</h1>
<p style="margin:8px 0 0;color:#fff;font-size:18px;font-weight:700;">+${credits} Kredit AI</p></td></tr>
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 16px;">Hai! 👋</p>
<p style="margin:0 0 16px;color:#475569;">Terima kasih! <strong>${credits} kredit AI</strong> dah ditambah ke akaun anda.</p></td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;">
<a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;">🚀 Mula Guna Sekarang</a></td></tr>
<tr><td style="background:#f8fafc;padding:20px 24px;text-align:center;">
<p style="margin:0;color:#94a3b8;font-size:12px;">© CeriaKid</p></td></tr>
</table></td></tr></table></body></html>`,
  };
}

Deno.serve(async (req) => {
  try {
    const { to, tier, credits, bonusCredits, type } = await req.json();

    if (!to || !type) return jsonResponse({ error: 'Missing required fields' }, 400);

    let emailContent;
    if (type === 'subscription') {
      if (!tier) return jsonResponse({ error: 'tier required' }, 400);
      emailContent = buildSubscriptionEmail(tier, bonusCredits || 0);
    } else if (type === 'credit') {
      if (!credits) return jsonResponse({ error: 'credits required' }, 400);
      emailContent = buildCreditEmail(credits);
    } else {
      return jsonResponse({ error: 'Invalid type' }, 400);
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
      return jsonResponse({ error: 'Resend not configured' }, 500);
    }

    const from = RESEND_FROM_EMAIL.includes('<') ? RESEND_FROM_EMAIL : `CeriaKid <${RESEND_FROM_EMAIL}>`;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const data = await resendResponse.json();
    if (!resendResponse.ok) {
      console.error('Resend API error:', data);
      return jsonResponse({ error: 'Email send failed' }, resendResponse.status);
    }

    console.log(`Welcome email sent (${type}) to ${to} — id=${data.id}`);
    return jsonResponse({ success: true, type, to, emailId: data.id });
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
});