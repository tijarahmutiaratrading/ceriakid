import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Daily scheduled function:
// 1. Auto-mark subscriptions sebagai 'canceled' kalau dah lepas tarikh tamat
// 2. Hantar email reminder pada 30, 14, 7, 1 hari sebelum tamat + email selepas tamat
// Setiap subscription dikesan supaya email yang sama tak dihantar berulang kali.
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
      return Response.json({ error: 'RESEND_API_KEY/RESEND_FROM_EMAIL not configured' }, { status: 500 });
    }

    const subs = await base44.asServiceRole.entities.UserSubscription.list('-created_date', 1000);
    const now = Date.now();
    const REMINDER_DAYS = [30, 14, 7, 1];

    let expiredCount = 0;
    let remindersSent = 0;

    const sendEmail = async (to, subject, html) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: RESEND_FROM_EMAIL, to, subject, html }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Resend ${res.status}: ${JSON.stringify(err)}`);
      }
    };

    for (const sub of subs) {
      if (!sub.currentPeriodEnd || sub.tier === 'free') continue;

      const endTime = new Date(sub.currentPeriodEnd).getTime();
      const daysLeft = Math.ceil((endTime - now) / (1000 * 60 * 60 * 24));
      const sentReminders = Array.isArray(sub.sentReminders) ? sub.sentReminders : [];
      const updates = {};

      // ─── 1. SUBSCRIPTION EXPIRED ───
      if (daysLeft <= 0 && sub.status === 'active') {
        updates.status = 'canceled';
        expiredCount++;

        if (!sentReminders.includes('expired')) {
          try {
            await sendEmail(sub.email, '🔒 Langganan CeriaKid Anda Telah Tamat', buildExpiredEmail(sub));
            sentReminders.push('expired');
            remindersSent++;
          } catch (e) { console.error(`Email failed for ${sub.email}:`, e.message); }
        }
      }

      // ─── 2. REMINDER EMAILS sebelum tamat ───
      if (daysLeft > 0 && daysLeft <= 30) {
        for (const milestone of REMINDER_DAYS) {
          if (daysLeft <= milestone && !sentReminders.includes(`day_${milestone}`)) {
            try {
              await sendEmail(sub.email, `⏳ ${daysLeft} hari lagi — Perbaharui langganan CeriaKid`, buildReminderEmail(sub, daysLeft));
              sentReminders.push(`day_${milestone}`);
              remindersSent++;
            } catch (e) { console.error(`Email failed for ${sub.email}:`, e.message); }
            break; // hantar satu reminder sahaja per run
          }
        }
      }

      if (sentReminders.length !== (sub.sentReminders || []).length || updates.status) {
        updates.sentReminders = sentReminders;
        await base44.asServiceRole.entities.UserSubscription.update(sub.id, updates);
      }
    }

    return Response.json({
      success: true,
      totalChecked: subs.length,
      expiredCount,
      remindersSent,
    });
  } catch (error) {
    console.error('sendExpiryReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildReminderEmail(sub, daysLeft) {
  const tierLabel = { asas: 'Asas', standard: 'Standard', keluarga: 'Keluarga' }[sub.tier] || sub.tier;
  const endDate = new Date(sub.currentPeriodEnd).toLocaleDateString('ms-MY');
  const urgency = daysLeft <= 7 ? '🚨 URGENT' : '⏳';
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:white;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:24px;">${urgency} ${daysLeft} hari lagi!</h1>
      <p style="margin:8px 0 0;opacity:0.95;font-size:14px;">Langganan CeriaKid anda akan tamat tempoh</p>
    </div>
    <div style="background:white;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px;padding:24px;">
      <p style="color:#333;font-size:15px;margin:0 0 16px;">Hai <strong>${sub.email}</strong>,</p>
      <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px;">Langganan <strong>${tierLabel}</strong> anda akan tamat pada <strong>${endDate}</strong> (${daysLeft} hari lagi).</p>
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px;border-radius:8px;margin:16px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;"><strong>Apa yang berlaku kalau tak perbaharui?</strong><br/>Semua games dan features akan dikunci secara automatik. Anak-anak tidak boleh main games yang dah biasa.</p>
      </div>
      <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 20px;">Perbaharui sekarang untuk pastikan akses tanpa gangguan. Bayaran melalui FPX/online banking — tiada auto-renew, anda kawal sepenuhnya.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://ceriakid.com" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">Perbaharui Sekarang</a>
      </div>
      <p style="color:#888;font-size:12px;text-align:center;margin:20px 0 0;">Terima kasih kerana memilih CeriaKid! 🎓</p>
    </div>
  </div>`;
}

function buildExpiredEmail(sub) {
  const tierLabel = { asas: 'Asas', standard: 'Standard', keluarga: 'Keluarga' }[sub.tier] || sub.tier;
  const endDate = new Date(sub.currentPeriodEnd).toLocaleDateString('ms-MY');
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#dc2626,#991b1b);color:white;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:24px;">🔒 Langganan Tamat Tempoh</h1>
      <p style="margin:8px 0 0;opacity:0.95;font-size:14px;">Akses CeriaKid anda telah dikunci</p>
    </div>
    <div style="background:white;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px;padding:24px;">
      <p style="color:#333;font-size:15px;margin:0 0 16px;">Hai <strong>${sub.email}</strong>,</p>
      <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px;">Langganan <strong>${tierLabel}</strong> anda telah tamat pada <strong>${endDate}</strong>.</p>
      <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:14px;border-radius:8px;margin:16px 0;">
        <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.5;"><strong>Status semasa:</strong><br/>Semua games dan features premium dikunci. Anda masih boleh login tetapi hanya games percuma terbuka.</p>
      </div>
      <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 20px;">Untuk mengembalikan akses penuh, perbaharui langganan anda melalui FPX/online banking. Progress anak-anak akan dikekalkan sepenuhnya.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://ceriakid.com" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">Perbaharui Sekarang</a>
      </div>
      <p style="color:#888;font-size:12px;text-align:center;margin:20px 0 0;">Kami harap dapat berkhidmat untuk keluarga anda lagi! 💜</p>
    </div>
  </div>`;
}