import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Send parent notifications via email
 * Triggered by achievements, streaks, or weekly reports
 * 
 * Usage:
 * base44.functions.invoke('sendParentNotification', {
 *   parentEmail: 'parent@email.com',
 *   childName: 'Ali',
 *   type: 'achievement', // achievement, streak, weekly_report
 *   data: { badgeName: '100 Bintang', emoji: '✨' }
 * })
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { parentEmail, childName, type, data } = await req.json();

    if (!parentEmail || !childName || !type) {
      return Response.json(
        { error: 'Missing required fields: parentEmail, childName, type' },
        { status: 400 }
      );
    }

    // Email templates
    const templates = {
      achievement: {
        subject: `🎉 ${childName} membuka badge "${data.badgeName}"!`,
        body: `
          <h2>Tahniah! 🎉</h2>
          <p>Anak anda ${childName} telah membuka badge baru: <strong>${data.badgeName}</strong> ${data.emoji}</p>
          <p>Terus semangat belajar!</p>
          <a href="https://ceriakid.com/parent-dashboard" style="padding: 10px 20px; background: #8b5cf6; color: white; border-radius: 5px; text-decoration: none;">Lihat Prestasi</a>
        `,
      },
      streak: {
        subject: `🔥 Streak ${data.days} hari untuk ${childName}!`,
        body: `
          <h2>Tahniah! 🔥</h2>
          <p>${childName} telah bermain ${data.days} hari berturut-turut!</p>
          <p>Jangan biar putus. Mainkan permainan hari ini untuk teruskan streak!</p>
        `,
      },
      weekly_report: {
        subject: `📊 Laporan Mingguan ${childName} - CeriaKid`,
        body: `
          <h2>Laporan Mingguan ${childName}</h2>
          <ul>
            <li>Total Permainan: ${data.totalGames}</li>
            <li>Bintang Dikumpul: ${data.totalStars}</li>
            <li>Mata Pelajaran Lemah: ${data.weakSubject}</li>
          </ul>
          <p>Cadangan: Fokus lebih pada ${data.weakSubject} untuk peningkatan yang lebih baik.</p>
        `,
      },
    };

    const template = templates[type];
    if (!template) {
      return Response.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Send via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
      return Response.json({ error: 'RESEND_API_KEY/RESEND_FROM_EMAIL not configured' }, { status: 500 });
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: parentEmail,
          subject: template.subject,
          html: template.body,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Resend send failed:', errData);
        return Response.json({
          success: true,
          warning: 'Notification queued but email delivery failed',
        });
      }

      return Response.json({
        success: true,
        message: `Notification sent to ${parentEmail}`,
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      return Response.json({
        success: true,
        warning: 'Notification queued but email delivery failed',
      });
    }
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});