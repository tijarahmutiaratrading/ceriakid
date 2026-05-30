// Parent notifications — achievements, streaks, weekly reports
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { requireUser } from '../_shared/authGuards.ts';
import { sendEmail } from '../_shared/resend.ts';

const TEMPLATES: Record<string, (childName: string, data: any) => { subject: string; html: string }> = {
  achievement: (childName, data) => ({
    subject: `🎉 ${childName} membuka badge "${data.badgeName}"!`,
    html: `<h2>Tahniah! 🎉</h2>
<p>Anak anda ${childName} telah membuka badge baru: <strong>${data.badgeName}</strong> ${data.emoji}</p>
<a href="https://ceriakid.com/parent-dashboard" style="padding:10px 20px;background:#8b5cf6;color:#fff;border-radius:5px;text-decoration:none;">Lihat Prestasi</a>`,
  }),
  streak: (childName, data) => ({
    subject: `🔥 Streak ${data.days} hari untuk ${childName}!`,
    html: `<h2>Tahniah! 🔥</h2>
<p>${childName} telah bermain ${data.days} hari berturut-turut!</p>`,
  }),
  weekly_report: (childName, data) => ({
    subject: `📊 Laporan Mingguan ${childName} - CeriaKid`,
    html: `<h2>Laporan Mingguan ${childName}</h2>
<ul><li>Total Permainan: ${data.totalGames}</li>
<li>Bintang Dikumpul: ${data.totalStars}</li>
<li>Mata Pelajaran Lemah: ${data.weakSubject}</li></ul>`,
  }),
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireUser(req);
  if (guard instanceof Response) return guard;

  try {
    const { parentEmail, childName, type, data } = await req.json();
    if (!parentEmail || !childName || !type) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const builder = TEMPLATES[type];
    if (!builder) return jsonResponse({ error: 'Invalid notification type' }, 400);

    const template = builder(childName, data || {});
    const result = await sendEmail({ to: parentEmail, subject: template.subject, html: template.html });

    return jsonResponse({
      success: true,
      ...(result.ok ? {} : { warning: 'Email send failed', error: result.error }),
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});