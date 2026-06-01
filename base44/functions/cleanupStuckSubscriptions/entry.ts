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
      } else {
        // Default: TAK BAYAR = CANCEL. Status mesti jadi free.
        await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
          status: 'canceled',
          tier: 'free',
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