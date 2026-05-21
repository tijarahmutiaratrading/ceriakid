import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Auto-cleanup: tukar status `incomplete` yang dah lebih 1 jam jadi `free`
// supaya user boleh retry checkout tanpa stuck di UI.
// Dijalankan secara automatik setiap 30 minit.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Service-level cleanup — boleh dipanggil tanpa user auth (scheduled automation)
    const allSubs = await base44.asServiceRole.entities.UserSubscription.list('-created_date', 500);
    const cutoff = Date.now() - 60 * 60 * 1000; // 1 jam lepas

    let cleaned = 0;
    for (const sub of allSubs) {
      if (sub.status !== 'incomplete') continue;
      const updatedAt = new Date(sub.updated_date || sub.created_date).getTime();
      if (updatedAt < cutoff) {
        await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
          status: 'canceled',
          tier: 'free',
        });
        cleaned++;
      }
    }

    return Response.json({ success: true, cleaned, message: `Cleaned ${cleaned} stuck incomplete subscriptions` });
  } catch (error) {
    console.error('cleanupStuckSubscriptions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});