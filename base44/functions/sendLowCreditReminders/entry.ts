import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Daily scheduled function — hantar email reminder kepada user
 * yang baki kredit AI dah rendah (< 5) dan masih ada subscription aktif.
 *
 * Logic:
 * - Hanya user dengan subscription tier 'asas'/'standard'/'keluarga' yang aktif
 *   (free tier tak digalakkan top-up)
 * - Hanya hantar SEKALI per 14 hari (cooldown) supaya tak spam
 * - Skip user yang dah TIDAK pernah top up (totalPurchased == 0 dan totalUsed < 3)
 *   — biasanya belum cuba lagi, tak relevan untuk reminder
 *
 * Tracking cooldown disimpan dalam metadata CreditTransaction terakhir (type='bonus'
 * dengan feature='admin' sebagai marker). Simple approach — tak perlu entity baru.
 */

const APP_URL = 'https://ceriakid.com';
const LOW_THRESHOLD = 5;
const COOLDOWN_DAYS = 14;

function buildEmail({ balance, email }) {
  return {
    subject: `💰 Kredit AI anda tinggal ${balance} sahaja!`,
    html: `<!DOCTYPE html>
<html lang="ms"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:28px 24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;">⚠️ Kredit Hampir Habis!</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.95);font-size:16px;">Baki: <strong>${balance} kredit</strong></p></td></tr>
<tr><td style="padding:24px;">
<p style="margin:0 0 14px;color:#1e293b;font-size:15px;">Hai! 👋</p>
<p style="margin:0 0 14px;color:#475569;font-size:14px;line-height:1.6;">
Baki kredit AI anda dah <strong>tinggal ${balance}</strong>. Top up sekarang supaya anak-anak boleh terus guna:
</p>
<ul style="margin:0 0 16px;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">
<li>💬 <strong>Cikgu Firdaus</strong> — Tutor AI</li>
<li>📝 <strong>Cikgu Rosie</strong> — Jana kuiz custom</li>
<li>📚 <strong>Cikgu Mira</strong> — Jana cerita pengajaran</li>
<li>🎨 <strong>Cikgu Daniel</strong> — Jana BBM</li>
</ul>
<div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:12px 14px;margin:0 0 18px;">
<p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">💡 <strong>Tip:</strong> Pakej Power (RM30) dapat 60 kredit + 10 bonus = 70 kredit. Paling jimat!</p>
</div>
</td></tr>
<tr><td style="padding:0 24px 24px;text-align:center;">
<a href="${APP_URL}/buy-credits" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:16px;">🚀 Top Up Sekarang</a>
</td></tr>
<tr><td style="background:#f8fafc;padding:18px 24px;text-align:center;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:12px;">© CeriaKid — Anda terima email ini sebab baki kredit AI anda rendah.</p></td></tr>
</table></td></tr></table></body></html>`,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const isScheduled = body.scheduled === true;

    if (!isScheduled) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
      }
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
      return Response.json({ error: 'Resend not configured' }, { status: 500 });
    }
    const from = RESEND_FROM_EMAIL.includes('<') ? RESEND_FROM_EMAIL : `CeriaKid <${RESEND_FROM_EMAIL}>`;

    // Ambil semua user yang baki rendah
    const lowCreditUsers = await base44.asServiceRole.entities.UserCredit.filter({
      balance: { $lte: LOW_THRESHOLD },
    });

    // Ambil semua active paid subscriptions
    const subs = await base44.asServiceRole.entities.UserSubscription.list('-created_date', 1000);
    const activePaidEmails = new Set(
      subs.filter(s => s.status === 'active' && s.tier && s.tier !== 'free').map(s => s.email)
    );

    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let sent = 0;
    let skipped = 0;

    for (const credit of lowCreditUsers) {
      // Skip kalau bukan active paid user
      if (!activePaidEmails.has(credit.userEmail)) {
        skipped++;
        continue;
      }
      // Skip user yang belum cuba langsung (totalUsed < 3 dan totalPurchased == 0)
      if ((credit.totalPurchased || 0) === 0 && (credit.totalUsed || 0) < 3) {
        skipped++;
        continue;
      }

      // Cooldown — cari reminder terakhir dalam CreditTransaction
      const recentReminders = await base44.asServiceRole.entities.CreditTransaction.filter({
        userEmail: credit.userEmail,
        type: 'admin_adjustment',
        feature: 'admin',
      });
      const lastReminder = recentReminders
        .filter(t => t.metadata?.kind === 'low_credit_reminder')
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

      if (lastReminder) {
        const ageMs = now - new Date(lastReminder.created_date).getTime();
        if (ageMs < cooldownMs) {
          skipped++;
          continue;
        }
      }

      // Hantar email
      const content = buildEmail({ balance: credit.balance || 0, email: credit.userEmail });
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to: credit.userEmail, subject: content.subject, html: content.html }),
        });
        if (!res.ok) {
          console.error(`Resend failed for ${credit.userEmail}: ${res.status}`);
          continue;
        }

        // Log marker — supaya cooldown berfungsi
        await base44.asServiceRole.entities.CreditTransaction.create({
          userEmail: credit.userEmail,
          type: 'admin_adjustment',
          amount: 0,
          balanceAfter: credit.balance || 0,
          feature: 'admin',
          description: `Reminder kredit rendah dihantar (baki ${credit.balance})`,
          metadata: { kind: 'low_credit_reminder', sentAt: new Date().toISOString() },
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${credit.userEmail}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      totalLowBalance: lowCreditUsers.length,
      sent,
      skipped,
    });
  } catch (error) {
    console.error('sendLowCreditReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});