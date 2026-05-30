// Weekly progress report email — sent to active paid subscribers
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdminOrScheduled } from '../_shared/authGuards.ts';
import { sendEmail } from '../_shared/resend.ts';

const CATEGORY_LABELS: Record<string, string> = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik',
  science: 'Sains', jawi: 'Jawi', general: 'Mini Games',
};
const CATEGORY_EMOJIS: Record<string, string> = {
  bahasa_melayu: '🇲🇾', english: '🇬🇧', mathematics: '🔢',
  science: '🔬', jawi: '🕌', general: '🎮',
};

function buildEmailHtml({ totalGames, totalStars, avgAccuracy, subjectBreakdown, weakSubject, childName }: any) {
  const greeting = childName ? `Laporan progress ${childName}` : 'Laporan progress anak anda';
  const subjectBars = subjectBreakdown.map((s: any) => {
    const pct = Math.min(100, Math.round((s.avgStars / 3) * 100));
    const emoji = CATEGORY_EMOJIS[s.key] || '📚';
    const label = CATEGORY_LABELS[s.key] || s.key;
    return `<tr><td style="padding:8px 0;">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
<span style="font-weight:700;color:#1e293b;">${emoji} ${label}</span>
<span style="font-weight:800;color:#7c3aed;">${s.avgStars.toFixed(1)}/3 ⭐</span></div>
<div style="background:#e2e8f0;height:8px;border-radius:999px;overflow:hidden;">
<div style="background:linear-gradient(90deg,#8b5cf6,#ec4899);height:100%;width:${pct}%;border-radius:999px;"></div></div></td></tr>`;
  }).join('');

  return `<!DOCTYPE html><html><body style="margin:0;background:#f1f5f9;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#8b5cf6,#ec4899,#f97316);padding:36px 28px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:26px;">📊 ${greeting}</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.95);">7 hari terakhir</p></td></tr>
<tr><td style="padding:28px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="text-align:center;padding:18px;background:#faf5ff;border-radius:16px;">
<p style="margin:0;color:#7c3aed;font-weight:800;font-size:11px;">DIMAINKAN</p>
<p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#581c87;">${totalGames}</p></td>
<td style="text-align:center;padding:18px;background:#fef3c7;border-radius:16px;">
<p style="margin:0;color:#ca8a04;font-weight:800;font-size:11px;">BINTANG</p>
<p style="margin:4px 0 0;font-size:28px;font-weight:900;">⭐${totalStars}</p></td>
<td style="text-align:center;padding:18px;background:#ecfdf5;border-radius:16px;">
<p style="margin:0;color:#059669;font-weight:800;font-size:11px;">KETEPATAN</p>
<p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#064e3b;">${avgAccuracy}%</p></td>
</tr></table></td></tr>
${subjectBreakdown.length > 0 ? `<tr><td style="padding:0 28px 24px;">
<h2 style="margin:0 0 14px;font-size:16px;font-weight:900;">📚 Progress Setiap Subjek</h2>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:16px;padding:16px 18px;">${subjectBars}</table></td></tr>` : ''}
${weakSubject ? `<tr><td style="padding:0 28px 20px;">
<div style="background:linear-gradient(135deg,#fef3c7,#fed7aa);border-radius:16px;padding:18px;">
<p style="margin:0;color:#c2410c;font-weight:900;font-size:12px;">💡 PERHATIAN IBU BAPA</p>
<p style="margin:6px 0 0;font-weight:800;color:#7c2d12;">${CATEGORY_EMOJIS[weakSubject.key] || '📚'} <strong>${CATEGORY_LABELS[weakSubject.key]}</strong> perlu perhatian</p></div></td></tr>` : ''}
<tr><td style="padding:0 28px 28px;text-align:center;">
<a href="https://ceriakid.com/parent-dashboard" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:900;">📊 Lihat Dashboard Penuh →</a></td></tr>
</table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  const guard = await requireAdminOrScheduled(req);
  if (guard instanceof Response) return guard;

  try {
    const { data: activeSubs } = await supabaseAdmin
      .from('ck_user_subscriptions')
      .select('*')
      .eq('status', 'active')
      .neq('tier', 'free')
      .limit(2000);

    let emailsSent = 0;

    for (const sub of activeSubs || []) {
      const { data: progress } = await supabaseAdmin
        .from('ck_child_game_progress')
        .select('*')
        .eq('user_email', sub.email);

      if (!progress || progress.length === 0) continue;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeek = progress.filter((p: any) => new Date(p.last_played_date) >= weekAgo);
      if (thisWeek.length === 0) continue;

      const totalStars = progress.reduce((s: number, p: any) => s + (p.best_stars || 0), 0);
      const avgAccuracy = Math.round(
        thisWeek.reduce((s: number, p: any) => s + ((p.last_score / Math.max(1, p.last_total)) * 100), 0) / thisWeek.length
      );

      const subjectStats: Record<string, any> = {};
      progress.forEach((p: any) => {
        if (!p.category) return;
        if (!subjectStats[p.category]) subjectStats[p.category] = { stars: 0, games: 0 };
        subjectStats[p.category].stars += p.best_stars || 0;
        subjectStats[p.category].games += 1;
      });

      const subjectBreakdown = Object.entries(subjectStats).map(([key, v]: [string, any]) => ({
        key, avgStars: v.stars / v.games, games: v.games,
      })).sort((a, b) => b.avgStars - a.avgStars);

      const weakSubject = subjectBreakdown.length > 0 ? subjectBreakdown[subjectBreakdown.length - 1] : null;
      const childName = Array.isArray(sub.children) && sub.children[0]?.name;

      const html = buildEmailHtml({
        totalGames: thisWeek.length, totalStars, avgAccuracy,
        subjectBreakdown, weakSubject, childName,
      });

      const r = await sendEmail({
        to: sub.email,
        subject: `📊 Laporan mingguan ${childName || 'anak anda'} — CeriaKid`,
        html,
      });
      if (r.ok) emailsSent++;
    }

    return jsonResponse({
      success: true,
      emailsSent,
      totalActiveSubs: activeSubs?.length || 0,
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});