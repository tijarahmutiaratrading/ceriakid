// Daily streak reminder push (6PM MY time)
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdminOrScheduled } from '../_shared/authGuards.ts';
import { setupVapid, sendToSubscribers } from '../_shared/webpush.ts';

Deno.serve(async (req) => {
  const guard = await requireAdminOrScheduled(req);
  if (guard instanceof Response) return guard;

  try {
    setupVapid();

    const { data: userSubs } = await supabaseAdmin
      .from('ck_push_subscriptions')
      .select('*')
      .eq('is_admin', false)
      .limit(2000);

    if (!userSubs || userSubs.length === 0) {
      return jsonResponse({ success: true, sent: 0, message: 'No user subscribers' });
    }

    // Index leaderboards by email
    const { data: leaderboards } = await supabaseAdmin
      .from('ck_leaderboards')
      .select('user_email, last_played_date, current_streak')
      .limit(5000);

    const leaderByEmail = new Map();
    for (const lb of leaderboards || []) {
      const key = (lb.user_email || '').toLowerCase();
      const existing = leaderByEmail.get(key);
      if (!existing || (lb.last_played_date && lb.last_played_date > existing.last_played_date)) {
        leaderByEmail.set(key, lb);
      }
    }

    const malaysiaTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const todayStr = malaysiaTime.toISOString().slice(0, 10);

    let totalSent = 0, totalFailed = 0, totalCleaned = 0, skipped = 0;

    for (const sub of userSubs) {
      const lb = leaderByEmail.get((sub.user_email || '').toLowerCase());

      // Skip if played today
      if (lb?.last_played_date) {
        const lastStr = new Date(lb.last_played_date).toISOString().slice(0, 10);
        if (lastStr >= todayStr) { skipped++; continue; }
      }

      const streak = lb?.current_streak || 0;
      let title: string, body: string;
      if (streak >= 3) {
        title = `🔥 Streak ${streak} hari! Jangan putus!`;
        body = 'Main 1 game je untuk kekalkan streak.';
      } else if (streak >= 1) {
        title = '📚 Adik anda belum main hari ni';
        body = `Streak ${streak} hari boleh terus naik.`;
      } else {
        title = '🎮 Jom main CeriaKid hari ni!';
        body = 'Mulakan streak harian — 5 minit je.';
      }

      const result = await sendToSubscribers([sub], { title, body, url: '/dashboard', tag: 'streak-reminder' });
      totalSent += result.sent;
      totalFailed += result.failed;
      totalCleaned += result.cleaned;
    }

    return jsonResponse({
      success: true,
      sent: totalSent,
      skipped,
      failed: totalFailed,
      cleaned: totalCleaned,
      totalChecked: userSubs.length,
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});