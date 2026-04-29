import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users with subscriptions
    const users = await base44.asServiceRole.entities.UserSubscription.list();
    
    const emailsToSend = [];

    for (const user of users) {
      // Get child progress
      const progress = await base44.asServiceRole.entities.ChildGameProgress.filter({
        userEmail: user.email,
      });

      if (progress.length === 0) continue;

      // Calculate stats
      const thisWeek = progress.filter(p => {
        const lastPlay = new Date(p.lastPlayedDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastPlay >= weekAgo;
      });

      const totalStars = progress.reduce((sum, p) => sum + (p.bestStars || 0), 0);
      const avgAccuracy = (thisWeek.length > 0 
        ? (thisWeek.reduce((sum, p) => sum + (p.lastScore / p.lastTotal * 100), 0) / thisWeek.length).toFixed(1)
        : 0);

      // Weak subjects
      const subjectStats = {};
      progress.forEach(p => {
        if (!subjectStats[p.category]) {
          subjectStats[p.category] = { stars: 0, games: 0 };
        }
        subjectStats[p.category].stars += p.bestStars || 0;
        subjectStats[p.category].games += 1;
      });

      const weakSubject = Object.entries(subjectStats)
        .sort((a, b) => (a[1].stars / a[1].games) - (b[1].stars / b[1].games))[0];

      const categoryLabels = {
        bahasa_melayu: 'Bahasa Melayu',
        english: 'English',
        mathematics: 'Matematik',
        science: 'Sains',
      };

      // Build email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 12px;">
          <h1 style="color: #8b5cf6; text-align: center; margin-bottom: 30px;">📊 Laporan Mingguan Anak</h1>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8b5cf6;">
            <h2 style="color: #333; margin: 0 0 15px 0;">Prestasi Minggu Ini</h2>
            <p style="margin: 8px 0; color: #666;"><strong>📚 Permainan Dimainkan:</strong> ${thisWeek.length}</p>
            <p style="margin: 8px 0; color: #666;"><strong>⭐ Total Bintang:</strong> ${totalStars}</p>
            <p style="margin: 8px 0; color: #666;"><strong>🎯 Ketepatan Rata-rata:</strong> ${avgAccuracy}%</p>
          </div>

          ${weakSubject ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h3 style="color: #d97706; margin: 0 0 10px 0;">💡 Subjek yang Perlu Ditingkatkan</h3>
              <p style="margin: 0; color: #92400e;"><strong>${categoryLabels[weakSubject[0]]}</strong> memerlukan latihan lebih. Rata-rata: ${(weakSubject[1].stars / weakSubject[1].games).toFixed(1)}/3 ⭐</p>
            </div>
          ` : ''}

          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
            <a href="https://jombelajar.app/parent-dashboard" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Lihat Laporan Lengkap</a>
          </div>

          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">Jom Belajar - Platform Pembelajaran Anak</p>
        </div>
      `;

      emailsToSend.push({
        to: user.email,
        subject: '📊 Laporan Mingguan Prestasi Anak - Jom Belajar',
        html: emailHtml,
      });
    }

    // Send all emails via Resend
    let successCount = 0;
    for (const email of emailsToSend) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'noreply@jombelajar.app',
            ...email,
          }),
        });
        if (response.ok) successCount++;
      } catch (e) {
        console.error(`Failed to send email to ${email.to}:`, e);
      }
    }

    return Response.json({
      success: true,
      message: `Sent ${successCount}/${emailsToSend.length} weekly reports`,
      emailsSent: successCount,
    });
  } catch (error) {
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});