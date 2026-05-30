import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  general: 'Mini Games',
};

const CATEGORY_EMOJIS = {
  bahasa_melayu: '🇲🇾',
  english: '🇬🇧',
  mathematics: '🔢',
  science: '🔬',
  jawi: '🕌',
  general: '🎮',
};

// Build a beautiful, modern HTML email with progress bars + visual stats.
function buildEmailHtml({ totalGames, totalStars, avgAccuracy, subjectBreakdown, weakSubject, childName }) {
  const greeting = childName ? `Laporan progress ${childName}` : 'Laporan progress anak anda';

  const subjectBars = subjectBreakdown
    .map((s) => {
      const pct = Math.min(100, Math.round((s.avgStars / 3) * 100));
      const emoji = CATEGORY_EMOJIS[s.key] || '📚';
      const label = CATEGORY_LABELS[s.key] || s.key;
      return `
        <tr>
          <td style="padding: 8px 0; vertical-align: top;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 700; font-size: 14px; color: #1e293b;">${emoji} ${label}</span>
              <span style="font-weight: 800; font-size: 13px; color: #7c3aed;">${s.avgStars.toFixed(1)}/3 ⭐</span>
            </div>
            <div style="background: #e2e8f0; height: 8px; border-radius: 999px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #8b5cf6, #ec4899); height: 100%; width: ${pct}%; border-radius: 999px;"></div>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laporan Mingguan CeriaKid</title>
</head>
<body style="margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%); padding: 36px 28px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(255,255,255,0.25); border-radius: 999px; margin-bottom: 12px;">
                <span style="color: #fde047; font-size: 11px; font-weight: 900; letter-spacing: 0.15em;">🎓 CERIAKID</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.15);">📊 ${greeting}</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.95); font-size: 14px; font-weight: 600;">7 hari terakhir</p>
            </td>
          </tr>

          <!-- Quick stats grid -->
          <tr>
            <td style="padding: 28px 28px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 6px 0 0;">
                    <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 16px; padding: 18px; text-align: center;">
                      <p style="margin: 0; font-size: 11px; font-weight: 800; color: #7c3aed; letter-spacing: 0.1em;">DIMAINKAN</p>
                      <p style="margin: 4px 0 0; font-size: 28px; font-weight: 900; color: #581c87;">${totalGames}</p>
                      <p style="margin: 0; font-size: 11px; font-weight: 700; color: #94a3b8;">game</p>
                    </div>
                  </td>
                  <td style="padding: 0 3px;">
                    <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 16px; padding: 18px; text-align: center;">
                      <p style="margin: 0; font-size: 11px; font-weight: 800; color: #ca8a04; letter-spacing: 0.1em;">BINTANG</p>
                      <p style="margin: 4px 0 0; font-size: 28px; font-weight: 900; color: #713f12;">⭐${totalStars}</p>
                      <p style="margin: 0; font-size: 11px; font-weight: 700; color: #94a3b8;">terkumpul</p>
                    </div>
                  </td>
                  <td style="padding: 0 0 0 6px;">
                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 16px; padding: 18px; text-align: center;">
                      <p style="margin: 0; font-size: 11px; font-weight: 800; color: #059669; letter-spacing: 0.1em;">KETEPATAN</p>
                      <p style="margin: 4px 0 0; font-size: 28px; font-weight: 900; color: #064e3b;">${avgAccuracy}%</p>
                      <p style="margin: 0; font-size: 11px; font-weight: 700; color: #94a3b8;">purata</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subject breakdown -->
          ${subjectBreakdown.length > 0 ? `
          <tr>
            <td style="padding: 24px 28px 0;">
              <h2 style="margin: 0 0 14px; font-size: 16px; font-weight: 900; color: #1e293b;">📚 Progress Setiap Subjek</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 16px; padding: 16px 18px;">
                ${subjectBars}
              </table>
            </td>
          </tr>` : ''}

          <!-- Weak subject focus -->
          ${weakSubject ? `
          <tr>
            <td style="padding: 20px 28px 0;">
              <div style="background: linear-gradient(135deg, #fef3c7, #fed7aa); border: 1px solid #fdba74; border-radius: 16px; padding: 18px;">
                <p style="margin: 0; font-size: 12px; font-weight: 900; color: #c2410c; letter-spacing: 0.1em;">💡 PERHATIAN IBU BAPA</p>
                <p style="margin: 6px 0 0; font-size: 15px; font-weight: 800; color: #7c2d12; line-height: 1.4;">
                  ${CATEGORY_EMOJIS[weakSubject.key] || '📚'} <strong>${CATEGORY_LABELS[weakSubject.key]}</strong> perlu lebih perhatian
                </p>
                <p style="margin: 4px 0 0; font-size: 13px; color: #9a3412; line-height: 1.5;">
                  Purata: ${weakSubject.avgStars.toFixed(1)}/3 ⭐ — Boleh galakkan anak main subjek ini 5–10 minit sehari.
                </p>
              </div>
            </td>
          </tr>` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding: 28px; text-align: center;">
              <a href="https://ceriakid.com/parent-dashboard" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: #ffffff; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 900; font-size: 15px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);">
                📊 Lihat Dashboard Penuh →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600;">
                🎓 <strong>CeriaKid</strong> — Platform Pembelajaran Anak Malaysia
              </p>
              <p style="margin: 6px 0 0; color: #94a3b8; font-size: 11px;">
                <a href="https://ceriakid.com/settings" style="color: #94a3b8; text-decoration: underline;">Urus notifikasi</a> &nbsp;•&nbsp;
                <a href="https://ceriakid.com/contact" style="color: #94a3b8; text-decoration: underline;">Hubungi kami</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow admin OR service role (for scheduled automation)
    let isFromUser = true;
    let adminUser = null;
    try { adminUser = await base44.auth.me(); } catch (_) { isFromUser = false; }
    if (isFromUser && adminUser?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
      return Response.json({ error: 'RESEND_API_KEY/RESEND_FROM_EMAIL not configured' }, { status: 500 });
    }

    const sr = base44.asServiceRole;
    const allSubs = await sr.entities.UserSubscription.list('', 2000);
    const activeSubs = allSubs.filter(s => s.status === 'active' && s.tier !== 'free');

    const emailsToSend = [];

    for (const sub of activeSubs) {
      const progress = await sr.entities.ChildGameProgress.filter({ userEmail: sub.email });
      if (progress.length === 0) continue;

      // Filter this week's plays
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeek = progress.filter(p => new Date(p.lastPlayedDate) >= weekAgo);
      if (thisWeek.length === 0) continue; // skip kalau tak main langsung minggu ni

      const totalStars = progress.reduce((sum, p) => sum + (p.bestStars || 0), 0);
      const avgAccuracy = thisWeek.length > 0
        ? Math.round(thisWeek.reduce((sum, p) => sum + ((p.lastScore / Math.max(1, p.lastTotal)) * 100), 0) / thisWeek.length)
        : 0;

      // Subject breakdown
      const subjectStats = {};
      progress.forEach(p => {
        if (!p.category) return;
        if (!subjectStats[p.category]) subjectStats[p.category] = { stars: 0, games: 0 };
        subjectStats[p.category].stars += p.bestStars || 0;
        subjectStats[p.category].games += 1;
      });

      const subjectBreakdown = Object.entries(subjectStats).map(([key, v]) => ({
        key,
        avgStars: v.stars / v.games,
        games: v.games,
      })).sort((a, b) => b.avgStars - a.avgStars);

      const weakSubject = subjectBreakdown.length > 0 ? subjectBreakdown[subjectBreakdown.length - 1] : null;

      // First child name (if any)
      const childName = Array.isArray(sub.children) && sub.children[0]?.name;

      const emailHtml = buildEmailHtml({
        totalGames: thisWeek.length,
        totalStars,
        avgAccuracy,
        subjectBreakdown,
        weakSubject,
        childName,
      });

      emailsToSend.push({
        to: sub.email,
        subject: `📊 Laporan mingguan ${childName ? childName : 'anak anda'} — CeriaKid`,
        html: emailHtml,
      });
    }

    let successCount = 0;
    for (const email of emailsToSend) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from: RESEND_FROM_EMAIL, ...email }),
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
      totalActiveSubs: activeSubs.length,
    });
  } catch (error) {
    console.error('sendWeeklyProgressReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});