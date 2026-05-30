// Enriched customer list for admin dashboard
// Combines: subscriptions + credits + devices + affiliate + referrals + users
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const [subsRes, creditsRes, devicesRes, affsRes, refsRes, usersRes] = await Promise.all([
      supabaseAdmin.from('ck_user_subscriptions').select('*').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('ck_user_credits').select('*').order('updated_at', { ascending: false }).limit(500),
      supabaseAdmin.from('ck_registered_devices').select('*').order('last_seen', { ascending: false }).limit(1000),
      supabaseAdmin.from('ck_affiliates').select('*').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('ck_affiliate_referrals').select('*').order('created_at', { ascending: false }).limit(1000),
      supabaseAdmin.from('ck_users').select('*').order('created_at', { ascending: false }).limit(2000),
    ]);

    const subscriptions = subsRes.data || [];
    const credits = creditsRes.data || [];
    const devices = devicesRes.data || [];
    const affiliates = affsRes.data || [];
    const referrals = refsRes.data || [];
    const users = usersRes.data || [];

    // Index helpers
    const userByEmail = new Map();
    users.forEach((u: any) => { if (u.email) userByEmail.set(u.email.toLowerCase(), u); });

    const creditByEmail = new Map();
    credits.forEach((c: any) => { if (c.user_email) creditByEmail.set(c.user_email.toLowerCase(), c); });

    const devicesByEmail = new Map();
    devices.forEach((d: any) => {
      if (!d.user_email) return;
      const key = d.user_email.toLowerCase();
      if (!devicesByEmail.has(key)) devicesByEmail.set(key, []);
      devicesByEmail.get(key).push({ id: d.id, deviceName: d.device_name, lastSeen: d.last_seen });
    });

    const affiliateByEmail = new Map();
    affiliates.forEach((a: any) => { if (a.user_email) affiliateByEmail.set(a.user_email.toLowerCase(), a); });

    const referralCountByAffiliate = new Map();
    referrals.forEach((r: any) => {
      if (!r.affiliate_email) return;
      const key = r.affiliate_email.toLowerCase();
      referralCountByAffiliate.set(key, (referralCountByAffiliate.get(key) || 0) + 1);
    });

    const customers = subscriptions.map((sub: any) => {
      const emailKey = (sub.email || '').toLowerCase();
      const credit = creditByEmail.get(emailKey);
      const userDevices = devicesByEmail.get(emailKey) || [];
      const affiliate = affiliateByEmail.get(emailKey);
      const userInfo = userByEmail.get(emailKey);
      const liveReferralCount = affiliate ? (referralCountByAffiliate.get(emailKey) || 0) : 0;

      return {
        id: sub.id,
        email: sub.email,
        fullName: sub.checkout_name || userInfo?.display_name || userInfo?.full_name || '',
        phone: sub.checkout_phone || userInfo?.phone || '',
        tier: sub.tier || 'free',
        status: sub.status || 'active',
        createdDate: sub.created_at,
        currentPeriodEnd: sub.current_period_end,
        currentPeriodStart: sub.current_period_start,
        abandonedReminderStatus: sub.abandoned_reminder_status || 'not_sent',
        abandonedReminderSentAt: sub.abandoned_reminder_sent_at,
        abandonedReminderMessageId: sub.abandoned_reminder_message_id,
        abandonedReminderError: sub.abandoned_reminder_error,
        recoveredAt: sub.recovered_at,
        childrenCount: Array.isArray(sub.children) ? sub.children.length : 0,
        children: Array.isArray(sub.children) ? sub.children.map((c: any) => ({ name: c.name, ageGroup: c.ageGroup })) : [],
        deviceCount: userDevices.length,
        devices: userDevices,
        creditBalance: credit?.balance || 0,
        creditTotalPurchased: credit?.total_purchased || 0,
        creditTotalUsed: credit?.total_used || 0,
        affiliate: affiliate ? {
          referralCode: affiliate.referral_code,
          status: affiliate.status || 'active',
          tier: affiliate.tier || 'bronze',
          totalReferrals: liveReferralCount,
          totalEarned: affiliate.total_earned || 0,
          pendingBalance: affiliate.pending_balance || 0,
          isActive: affiliate.status === 'active',
        } : null,
      };
    });

    return jsonResponse({ customers, total: customers.length });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});