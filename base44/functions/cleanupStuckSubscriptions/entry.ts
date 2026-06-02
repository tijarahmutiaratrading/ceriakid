import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Auto-cleanup: tukar status `incomplete` yang dah lebih 2 jam jadi `canceled`/`free`.
// User tak bayar = tak boleh dapat akses. PERIOD.
//
// CRITICAL: Function ni TAK PERNAH tukar status jadi `active` SECARA AUTOMATIK.
// Sebelum cancel, kita verify dulu dengan CHIP API — kalau betul-betul `paid`
// (rare case: webhook tertinggal), baru activate. Kalau tak paid, terus cancel.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allSubs = await base44.asServiceRole.entities.UserSubscription.list('-created_date', 500);
    const cutoff = Date.now() - 2 * 60 * 60 * 1000; // 2 jam lepas (cukup masa user complete bayar)

    const CHIP_SECRET = Deno.env.get('CHIP_SECRET_KEY');

    let cleaned = 0;
    let verifiedPaid = 0;
    let canceled = 0;

    for (const sub of allSubs) {
      if (sub.status !== 'incomplete') continue;
      const updatedAt = new Date(sub.updated_date || sub.created_date).getTime();
      if (updatedAt >= cutoff) continue;

      // Last-chance check — verify CHIP payment SEBELUM cancel.
      // Mungkin webhook tertinggal (network issue) — bagi peluang final verify.
      let isPaid = false;
      if (CHIP_SECRET && sub.stripeCustomerId) {
        try {
          const res = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${sub.stripeCustomerId}/`, {
            headers: { 'Authorization': `Bearer ${CHIP_SECRET}` }
          });
          if (res.ok) {
            const data = await res.json();
            isPaid = data.status === 'paid';
          }
        } catch (_) { /* ignore — default to cancel */ }
      }

      if (isPaid) {
        // CHIP confirm BETUL-BETUL paid → activate (rare: webhook missed)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: expiryDate.toISOString(),
        });
        verifiedPaid++;
        console.log(`✅ Late activation (webhook missed): ${sub.email} → ${sub.tier}`);

        // Trigger welcome flow yang webhook patut buat tapi tertinggal.
        // Idempotent: addCredits guna referenceId `welcome__<purchaseId>` — kalau dah ada, skip.
        const WELCOME_CREDITS = { asas: 5, standard: 20, keluarga: 50 };
        const bonusAmount = WELCOME_CREDITS[sub.tier] || 0;
        const purchaseId = sub.stripeCustomerId;

        await Promise.allSettled([
          // Welcome email
          base44.asServiceRole.functions.invoke('sendWelcomeEmail', {
            to: sub.email,
            type: 'subscription',
            tier: sub.tier,
            bonusCredits: bonusAmount,
          }),
          // Bonus credits (idempotent via referenceId)
          bonusAmount > 0 ? base44.asServiceRole.functions.invoke('addCredits', {
            userEmail: sub.email,
            amount: bonusAmount,
            type: 'bonus',
            feature: 'bonus',
            description: `🎁 Bonus selamat datang — pelan ${sub.tier} (${bonusAmount} kredit AI percuma) [auto-recovery]`,
            referenceId: `welcome__${purchaseId}`,
            metadata: { tier: sub.tier, chipPurchaseId: purchaseId, source: 'cleanup_late_activation' },
          }) : Promise.resolve(),
          // Admin push
          base44.asServiceRole.functions.invoke('sendPushNotification', {
            title: '⚠️ Late Activation (Webhook Missed)',
            body: `${sub.email} → ${sub.tier.toUpperCase()} auto-recovered via cleanup`,
          }),
        ]).catch(() => {}); // fire-and-forget — jangan break loop
      } else {
        // Default: TAK BAYAR = CANCEL. Tier kekal (tak ada pakej 'free') — user boleh retry checkout.
        await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
          status: 'canceled',
        });
        canceled++;
        console.log(`❌ Canceled (no payment): ${sub.email}`);
      }
      cleaned++;
    }

    return Response.json({
      success: true,
      cleaned,
      verifiedPaid,
      canceled,
      message: `Processed ${cleaned} stuck incomplete subs (${verifiedPaid} late-activated, ${canceled} canceled)`,
    });
  } catch (error) {
    console.error('cleanupStuckSubscriptions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});