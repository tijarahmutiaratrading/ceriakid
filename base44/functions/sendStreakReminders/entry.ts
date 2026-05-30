import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import webpush from 'npm:web-push@3.6.7';

/**
 * Daily streak reminder push notification.
 * Run automatically via scheduled automation pukul 6PM Malaysia time.
 *
 * Logic:
 * 1. Loop semua PushSubscription yang isAdmin=false (user subscriptions)
 * 2. Untuk setiap user, check Leaderboard `lastPlayedDate`:
 *    - Kalau belum main hari ni → hantar reminder
 *    - Kalau dah main → skip
 * 3. Custom message kalau ada streak aktif (e.g. "5 hari berturut-turut!")
 *
 * Auth: admin sahaja kalau call manual. Service role (cron) auto-allow.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let isFromUser = true;
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { isFromUser = false; }
    if (isFromUser && user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    let subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@ceriakid.com';
    if (!publicKey || !privateKey) {
      return Response.json({ error: 'VAPID not configured' }, { status: 500 });
    }

    // Sanitize subject (sama macam sendPushNotification)
    subject = subject.trim().replace(/[<>]/g, '').replace(/\s+/g, '');
    if (!subject.startsWith('mailto:') && !subject.startsWith('http')) {
      subject = `mailto:${subject}`;
    }
    subject = subject.replace(/^mailto:\s+/, 'mailto:');

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const sr = base44.asServiceRole;

    // Ambil semua user push subscriptions (bukan admin)
    const allSubs = await sr.entities.PushSubscription.list('', 2000);
    const userSubs = allSubs.filter(s => s.isAdmin === false);

    if (userSubs.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No user subscribers' });
    }

    // Ambil Leaderboard untuk semua user — index by userEmail
    const leaderboards = await sr.entities.Leaderboard.list('', 5000);
    const leaderByEmail = new Map();
    for (const lb of leaderboards) {
      const key = (lb.userEmail || '').toLowerCase();
      const existing = leaderByEmail.get(key);
      // Ambil yang lastPlayedDate paling latest (kalau ada multiple children)
      if (!existing || (lb.lastPlayedDate && lb.lastPlayedDate > existing.lastPlayedDate)) {
        leaderByEmail.set(key, lb);
      }
    }

    // Today di Malaysia (UTC+8)
    const now = new Date();
    const malaysiaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = malaysiaTime.toISOString().slice(0, 10); // YYYY-MM-DD

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const deadEndpoints = [];

    await Promise.all(userSubs.map(async (sub) => {
      const emailKey = (sub.userEmail || '').toLowerCase();
      const lb = leaderByEmail.get(emailKey);

      // Skip kalau dah main hari ni
      if (lb?.lastPlayedDate) {
        const lastPlayedStr = new Date(lb.lastPlayedDate).toISOString().slice(0, 10);
        if (lastPlayedStr >= todayStr) {
          skipped++;
          return;
        }
      }

      // Build message ikut streak
      const streak = lb?.currentStreak || 0;
      let title, body;
      if (streak >= 3) {
        title = `🔥 Streak ${streak} hari! Jangan putus!`;
        body = 'Main 1 game je untuk kekalkan streak. Cepat sebelum tengah malam!';
      } else if (streak >= 1) {
        title = '📚 Adik anda belum main hari ni';
        body = `Streak ${streak} hari boleh terus naik kalau main sekarang. Jom!`;
      } else {
        title = '🎮 Jom main CeriaKid hari ni!';
        body = 'Mulakan streak harian — anak belajar 5 minit je sehari.';
      }

      const payload = JSON.stringify({
        title,
        body,
        url: '/dashboard',
        tag: 'streak-reminder',
        icon: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png',
      });

      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err) {
        failed++;
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadEndpoints.push(sub.id);
        }
      }
    }));

    // Cleanup dead subscriptions
    for (const id of deadEndpoints) {
      try { await sr.entities.PushSubscription.delete(id); } catch (_) {}
    }

    return Response.json({
      success: true,
      sent,
      skipped,
      failed,
      cleaned: deadEndpoints.length,
      totalChecked: userSubs.length,
    });
  } catch (error) {
    console.error('sendStreakReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});