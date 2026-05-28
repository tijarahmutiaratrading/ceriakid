import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Returns enriched customer data for the admin dashboard.
// Combines: UserSubscription + UserCredit + RegisteredDevice + Affiliate (referral code & stats) + AffiliateReferral count
// Output: array of customer objects, sorted by created_date DESC.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Pull all relevant data in parallel via service role (admin scope)
    const sr = base44.asServiceRole;
    const [subscriptions, credits, devices, affiliates, referrals, users] = await Promise.all([
      sr.entities.UserSubscription.list('-created_date', 500),
      sr.entities.UserCredit.list('-updated_date', 500),
      sr.entities.RegisteredDevice.list('-lastSeen', 1000),
      sr.entities.Affiliate.list('-created_date', 500),
      sr.entities.AffiliateReferral.list('-created_date', 1000),
      sr.entities.User.list('-created_date', 500),
    ]);

    // Index users by email
    const userByEmail = new Map();
    users.forEach(u => { if (u.email) userByEmail.set(u.email.toLowerCase(), u); });

    // Index by email for fast lookup
    const creditByEmail = new Map();
    credits.forEach(c => { if (c.userEmail) creditByEmail.set(c.userEmail.toLowerCase(), c); });

    const devicesByEmail = new Map();
    devices.forEach(d => {
      if (!d.userEmail) return;
      const key = d.userEmail.toLowerCase();
      if (!devicesByEmail.has(key)) devicesByEmail.set(key, []);
      devicesByEmail.get(key).push({
        id: d.id,
        deviceName: d.deviceName,
        lastSeen: d.lastSeen,
      });
    });

    const affiliateByEmail = new Map();
    affiliates.forEach(a => { if (a.userEmail) affiliateByEmail.set(a.userEmail.toLowerCase(), a); });

    // Count referrals per affiliate (independent of stored totalReferrals — recompute live)
    const referralCountByAffiliate = new Map();
    referrals.forEach(r => {
      if (!r.affiliateEmail) return;
      const key = r.affiliateEmail.toLowerCase();
      referralCountByAffiliate.set(key, (referralCountByAffiliate.get(key) || 0) + 1);
    });

    // Build enriched customer list — one row per subscription (the canonical user)
    const customers = subscriptions.map(sub => {
      const emailKey = (sub.email || '').toLowerCase();
      const credit = creditByEmail.get(emailKey);
      const userDevices = devicesByEmail.get(emailKey) || [];
      const affiliate = affiliateByEmail.get(emailKey);
      const userInfo = userByEmail.get(emailKey);
      const liveReferralCount = affiliate
        ? (referralCountByAffiliate.get(emailKey) || 0)
        : 0;

      return {
        id: sub.id,
        email: sub.email,
        fullName: userInfo?.full_name || '',
        phone: userInfo?.phone || '',
        tier: sub.tier || 'free',
        status: sub.status || 'active',
        createdDate: sub.created_date,
        currentPeriodEnd: sub.currentPeriodEnd || null,
        currentPeriodStart: sub.currentPeriodStart || null,
        // Abandoned cart recovery tracking
        abandonedReminderStatus: sub.abandonedReminderStatus || 'not_sent',
        abandonedReminderSentAt: sub.abandonedReminderSentAt || null,
        abandonedReminderMessageId: sub.abandonedReminderMessageId || null,
        abandonedReminderError: sub.abandonedReminderError || null,
        recoveredAt: sub.recoveredAt || null,
        // Children
        childrenCount: Array.isArray(sub.children) ? sub.children.length : 0,
        children: Array.isArray(sub.children) ? sub.children.map(c => ({
          name: c.name,
          ageGroup: c.ageGroup,
        })) : [],
        // Devices
        deviceCount: userDevices.length,
        devices: userDevices,
        // Credits
        creditBalance: credit?.balance || 0,
        creditTotalPurchased: credit?.totalPurchased || 0,
        creditTotalUsed: credit?.totalUsed || 0,
        // Affiliate
        affiliate: affiliate ? {
          referralCode: affiliate.referralCode,
          status: affiliate.status || 'active',
          tier: affiliate.tier || 'bronze',
          totalReferrals: liveReferralCount,
          totalEarned: affiliate.totalEarned || 0,
          pendingBalance: affiliate.pendingBalance || 0,
          isActive: affiliate.status === 'active',
        } : null,
      };
    });

    return Response.json({ customers, total: customers.length });
  } catch (error) {
    console.error('getCustomerDetails error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});