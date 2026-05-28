import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Hantar email selamat datang kepada customer baru selepas pembelian berjaya.
 *
 * Payload:
 *   - to: string (email pelanggan)
 *   - tier?: 'asas' | 'standard' | 'keluarga'  (untuk subscription)
 *   - credits?: number (untuk credit top-up)
 *   - bonusCredits?: number (bonus selamat datang dari subscription)
 *   - type: 'subscription' | 'credit'
 *
 * Dipanggil dari chipWebhook (server-to-server) selepas payment confirmed.
 */

const TIER_LABEL = {
  asas: 'Asas',
  standard: 'Standard',
  keluarga: 'Keluarga',
};

const APP_URL = 'https://ceriakid.com';
const WHATSAPP_NUMBER = '60177844120'; // 017-784 4120
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Salam, saya perlukan bantuan dengan akaun CeriaKid saya.')}`;

function buildSubscriptionEmail({ tier, bonusCredits }) {
  const tierName = TIER_LABEL[tier] || tier;
  const bonusLine = bonusCredits > 0
    ? `<p style="margin:0 0 12px;color:#475569"><strong>🎁 Bonus selamat datang:</strong> Anda dapat <strong>${bonusCredits} kredit AI percuma</strong> untuk cuba ciri-ciri Cikgu AI!</p>`
    : '';

  return {
    subject: `🎉 Selamat datang ke CeriaKid — Pelan ${tierName} anda dah aktif!`,
    html: `<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

        <!-- Hero -->
        <tr><td style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:32px 24px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">🎉 Tahniah!</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.95);font-size:16px;">Pelan <strong>${tierName}</strong> anda dah aktif</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px 24px;">
          <p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Hai! 👋</p>
          <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
            Terima kasih sebab langgan CeriaKid. Subscription anda dah aktif untuk <strong>1 tahun penuh</strong>. Anak-anak dah boleh mula belajar sambil bermain sekarang!
          </p>
          ${bonusLine}
        </td></tr>

        <!-- IMPORTANT NOTICE -->
        <tr><td style="padding:0 24px 20px;">
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px;">
            <p style="margin:0;color:#78350f;font-size:14px;font-weight:700;">⚠️ PENTING — Sila baca dulu</p>
            <p style="margin:6px 0 0;color:#92400e;font-size:13px;line-height:1.6;">
              Anda <strong>perlu daftar akaun dulu</strong> di CeriaKid sebelum boleh login. Pastikan guna <strong>email yang SAMA</strong> dengan email anda beli pelan tadi, supaya subscription auto-aktif.
            </p>
          </div>
        </td></tr>

        <!-- CTA Login -->
        <tr><td style="padding:0 24px 24px;text-align:center;">
          <a href="${APP_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:16px;">
            🚀 Daftar / Login Sekarang
          </a>
          <p style="margin:12px 0 0;color:#94a3b8;font-size:13px;">Klik butang <strong>"Dashboard"</strong> di header untuk daftar/login</p>
        </td></tr>

        <!-- Quick Start Guide -->
        <tr><td style="padding:0 24px 24px;">
          <div style="background:#f8fafc;border-radius:12px;padding:20px;">
            <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:800;">📋 Panduan Ringkas — 4 Langkah</h2>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:8px 0;">
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:700;">1️⃣ Daftar Akaun Dulu</p>
                <p style="margin:4px 0 0;color:#64748b;font-size:14px;line-height:1.5;">Pergi ke <a href="${APP_URL}" style="color:#a855f7;font-weight:600;">${APP_URL}</a> → klik butang <strong>"Dashboard"</strong> di header → page <strong>Daftar/Login</strong> akan muncul. Daftar guna <strong>email yang sama</strong> dengan email pembelian, set password, dan verify email anda. Lepas tu barulah boleh login.</p>
              </td></tr>

              <tr><td style="padding:8px 0;">
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:700;">2️⃣ Tambah Profil Anak</p>
                <p style="margin:4px 0 0;color:#64748b;font-size:14px;line-height:1.5;">Klik "Profil Anak" → tambah nama & umur anak. Setiap anak boleh ada progress sendiri.</p>
              </td></tr>

              <tr><td style="padding:8px 0;">
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:700;">3️⃣ Pasang App ke Phone (Optional)</p>
                <p style="margin:4px 0 0;color:#64748b;font-size:14px;line-height:1.5;">Buka ${APP_URL} di Safari (iPhone) atau Chrome (Android) → klik "Share" → "Add to Home Screen". App akan jadi macam app biasa.</p>
              </td></tr>

              <tr><td style="padding:8px 0;">
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:700;">4️⃣ Mula Main!</p>
                <p style="margin:4px 0 0;color:#64748b;font-size:14px;line-height:1.5;">Pilih anak dari dashboard → pergi ke "Games Hub" → pilih subjek (BM, English, Math, Sains, Jawi & banyak lagi). Selamat belajar! 🎮</p>
              </td></tr>
            </table>
          </div>
        </td></tr>

        <!-- AI Features -->
        <tr><td style="padding:0 24px 24px;">
          <div style="background:#fef3c7;border-radius:12px;padding:20px;">
            <h3 style="margin:0 0 12px;color:#78350f;font-size:16px;font-weight:800;">✨ Cuba Cikgu AI (guna kredit anda)</h3>
            <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;">
              • <strong>Cikgu Firdaus</strong> — Tutor AI untuk jawab soalan<br>
              • <strong>Cikgu Rosie</strong> — Jana kuiz custom<br>
              • <strong>Cikgu Mira</strong> — Jana cerita pengajaran<br>
              • <strong>Cikgu Daniel</strong> — Jana BBM (Bahan Bantu Mengajar)
            </p>
          </div>
        </td></tr>

        <!-- Support -->
        <tr><td style="padding:0 24px 28px;text-align:center;">
          <p style="margin:0 0 12px;color:#64748b;font-size:14px;">Ada soalan? Kami sedia membantu — WhatsApp terus!</p>
          <a href="${WHATSAPP_URL}" style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;font-size:15px;">
            💬 WhatsApp: 017-784 4120
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
            © CeriaKid — Platform Pembelajaran Interaktif untuk Anak Malaysia<br>
            Anda terima email ini sebab anda baru langgan CeriaKid.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

function buildCreditEmail({ credits }) {
  return {
    subject: `💰 ${credits} kredit AI dah masuk akaun anda!`,
    html: `<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

        <tr><td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px 24px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;">💰 Kredit Dah Masuk!</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.95);font-size:18px;font-weight:700;">+${credits} Kredit AI</p>
        </td></tr>

        <tr><td style="padding:28px 24px;">
          <p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Hai! 👋</p>
          <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
            Terima kasih! <strong>${credits} kredit AI</strong> dah ditambah ke akaun anda. Gunakan kredit ini untuk:
          </p>
          <ul style="margin:0 0 16px;padding-left:20px;color:#475569;font-size:15px;line-height:1.8;">
            <li>💬 Tanya soalan dengan <strong>Cikgu Firdaus</strong> (tutor AI)</li>
            <li>📝 Jana kuiz custom dengan <strong>Cikgu Rosie</strong></li>
            <li>📚 Jana cerita pengajaran dengan <strong>Cikgu Mira</strong></li>
            <li>🎨 Jana BBM (Bahan Bantu Mengajar) dengan <strong>Cikgu Daniel</strong></li>
          </ul>
        </td></tr>

        <tr><td style="padding:0 24px 20px;text-align:center;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:16px;">
            🚀 Mula Guna Sekarang
          </a>
        </td></tr>

        <!-- Support -->
        <tr><td style="padding:0 24px 24px;text-align:center;">
          <p style="margin:0 0 12px;color:#64748b;font-size:14px;">Ada soalan? WhatsApp kami terus!</p>
          <a href="${WHATSAPP_URL}" style="display:inline-block;padding:12px 24px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;font-size:15px;">
            💬 WhatsApp: 017-784 4120
          </a>
        </td></tr>

        <tr><td style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© CeriaKid — Platform Pembelajaran Interaktif</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

function extractEmail(fromString) {
  const match = fromString.match(/<(.+)>/);
  return match ? match[1] : fromString;
}

Deno.serve(async (req) => {
  try {
    const { to, tier, credits, bonusCredits, type } = await req.json();

    if (!to || !type) {
      return Response.json({ error: 'Missing required fields: to, type' }, { status: 400 });
    }

    let emailContent;
    if (type === 'subscription') {
      if (!tier) return Response.json({ error: 'tier required for subscription' }, { status: 400 });
      emailContent = buildSubscriptionEmail({ tier, bonusCredits: bonusCredits || 0 });
    } else if (type === 'credit') {
      if (!credits) return Response.json({ error: 'credits required for credit type' }, { status: 400 });
      emailContent = buildCreditEmail({ credits });
    } else {
      return Response.json({ error: 'Invalid type (subscription | credit)' }, { status: 400 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
      return Response.json({ error: 'Resend not configured' }, { status: 500 });
    }

    // Build From — prefix dengan "CeriaKid" untuk branding
    const fromEmail = extractEmail(RESEND_FROM_EMAIL);
    const from = `CeriaKid <${fromEmail}>`;

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

    const responseData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', responseData);
      return Response.json({ error: 'Email send failed', details: responseData }, { status: resendResponse.status });
    }

    console.log(`Welcome email sent (${type}) to ${to} — id=${responseData.id}`);
    return Response.json({ success: true, type, to, emailId: responseData.id });
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});