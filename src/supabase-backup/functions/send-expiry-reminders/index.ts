// Daily expiry reminders + auto-expire subscriptions
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdminOrScheduled } from '../_shared/authGuards.ts';
import { sendEmail } from '../_shared/resend.ts';

const REMINDER_DAYS = [30, 14, 7, 1];
const TIER_LABEL: Record<string, string> = { asas: 'Asas', standard: 'Standard', keluarga: 'Keluarga' };

function buildReminderEmail(sub: any, daysLeft: number) {
  const tierLabel = TIER_LABEL[sub.tier] || sub.tier;
  const endDate = new Date(sub.current_period_end).toLocaleDateString('ms-MY');
  const urgency = daysLeft <= 7 ? '🚨 URGENT' : '⏳';
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<div style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
<h1 style="margin:0;font-size:24px;">${urgency} ${daysLeft} hari lagi!</h1>
<p style="margin:8px 0 0;">Langganan CeriaKid akan tamat tempoh</p></div>
<div style="background:#fff;border:1px solid #eee;padding:24px;border-radius:0 0 16px 16px;">
<p>Hai <strong>${sub.email}</strong>,</p>
<p>Langganan <strong>${tierLabel}</strong> tamat pada <strong>${endDate}</strong>.</p>
<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px;border-radius:8px;margin:16px 0;">
<strong>Apa berlaku kalau tak perbaharui?</strong><br/>Semua games dan features akan dikunci.</div>
<div style="text-align:center;margin:24px 0;">
<a href="https://ceriakid.com" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;">Perbaharui Sekarang</a>
</div></div></div>`;
}

function buildExpiredEmail(sub: any) {
  const tierLabel = TIER_LABEL[sub.tier] || sub.tier;
  const endDate = new Date(sub.current_period_end).toLocaleDateString('ms-MY');
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<div style="background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
<h1 style="margin:0;font-size:24px;">🔒 Langganan Tamat Tempoh</h1></div>
<div style="background:#fff;border:1px solid #eee;padding:24px;border-radius:0 0 16px 16px;">
<p>Hai <strong>${sub.email}</strong>,</p>
<p>Langganan <strong>${tierLabel}</strong> tamat pada <strong>${endDate}</strong>.</p>
<div style="text-align:center;margin:24px 0;">
<a href="https://ceriakid.com" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;">Perbaharui Sekarang</a>
</div></div></div>`;
}

Deno.serve(async (req) => {
  const guard = await requireAdminOrScheduled(req);
  if (guard instanceof Response) return guard;

  try {
    const { data: subs } = await supabaseAdmin
      .from('ck_user_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    const now = Date.now();
    let expiredCount = 0, remindersSent = 0;

    for (const sub of subs || []) {
      if (!sub.current_period_end || sub.tier === 'free') continue;

      const endTime = new Date(sub.current_period_end).getTime();
      const daysLeft = Math.ceil((endTime - now) / (1000 * 60 * 60 * 24));
      const sentReminders: string[] = Array.isArray(sub.sent_reminders) ? sub.sent_reminders : [];
      const updates: any = {};

      // Expired
      if (daysLeft <= 0 && sub.status === 'active') {
        updates.status = 'canceled';
        expiredCount++;
        if (!sentReminders.includes('expired')) {
          const r = await sendEmail({
            to: sub.email,
            subject: '🔒 Langganan CeriaKid Anda Telah Tamat',
            html: buildExpiredEmail(sub),
          });
          if (r.ok) { sentReminders.push('expired'); remindersSent++; }
        }
      }

      // Pre-expiry reminders
      if (daysLeft > 0 && daysLeft <= 30) {
        for (const milestone of REMINDER_DAYS) {
          if (daysLeft <= milestone && !sentReminders.includes(`day_${milestone}`)) {
            const r = await sendEmail({
              to: sub.email,
              subject: `⏳ ${daysLeft} hari lagi — Perbaharui CeriaKid`,
              html: buildReminderEmail(sub, daysLeft),
            });
            if (r.ok) { sentReminders.push(`day_${milestone}`); remindersSent++; }
            break;
          }
        }
      }

      if (sentReminders.length !== (sub.sent_reminders?.length || 0) || updates.status) {
        updates.sent_reminders = sentReminders;
        await supabaseAdmin.from('ck_user_subscriptions').update(updates).eq('id', sub.id);
      }
    }

    return jsonResponse({ success: true, totalChecked: subs?.length || 0, expiredCount, remindersSent });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});