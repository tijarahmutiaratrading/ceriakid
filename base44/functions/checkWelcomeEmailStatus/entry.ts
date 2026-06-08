import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Semak status sebenar welcome email dengan Resend API (delivered / bounced / complained / dll)
// dan kemas kini status dalam UserSubscription.
//
// Payload (admin only):
//   - subscriptionId?: string  → semak satu subscription sahaja
//   - (kosong)                 → semak SEMUA subscription yang ada welcomeEmailMessageId
//                                tapi belum 'delivered'/'bounced'/'complained' (status final)
//
// Resend Get Email API: GET https://api.resend.com/emails/{id}
// Field `last_event` mengandungi status terkini: sent | delivered | bounced | complained | delivery_delayed

const FINAL_STATUSES = ['delivered', 'bounced', 'complained'];

// Map last_event Resend → status kita simpan
function mapResendEvent(lastEvent) {
  switch (lastEvent) {
    case 'delivered': return 'delivered';
    case 'bounced': return 'bounced';
    case 'complained': return 'complained';
    case 'sent':
    case 'delivery_delayed':
    default: return 'sent';
  }
}

async function checkOne(RESEND_API_KEY, messageId) {
  const res = await fetch(`https://api.resend.com/emails/${messageId}`, {
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data?.message || data?.error || `HTTP ${res.status}` };
  }
  return { ok: true, lastEvent: data?.last_event || 'sent' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return Response.json({ error: 'Resend not configured' }, { status: 500 });
    }

    const { subscriptionId } = await req.json().catch(() => ({}));
    const sr = base44.asServiceRole;
    const nowIso = new Date().toISOString();

    // Tentukan senarai subscription untuk disemak
    let targets = [];
    if (subscriptionId) {
      const sub = await sr.entities.UserSubscription.get(subscriptionId);
      if (sub) targets = [sub];
    } else {
      const all = await sr.entities.UserSubscription.list('-created_date', 500);
      targets = all.filter(s =>
        s.welcomeEmailMessageId &&
        !FINAL_STATUSES.includes(s.welcomeEmailStatus)
      );
    }

    let checked = 0, updated = 0, errors = 0;
    const results = [];

    for (const sub of targets) {
      if (!sub.welcomeEmailMessageId) {
        results.push({ email: sub.email, skipped: 'no_message_id' });
        continue;
      }
      checked++;
      const r = await checkOne(RESEND_API_KEY, sub.welcomeEmailMessageId);
      if (!r.ok) {
        errors++;
        results.push({ email: sub.email, error: r.error });
        continue;
      }
      const newStatus = mapResendEvent(r.lastEvent);
      const updateData = {
        welcomeEmailLastCheckedAt: nowIso,
      };
      if (newStatus !== sub.welcomeEmailStatus) {
        updateData.welcomeEmailStatus = newStatus;
        updated++;
      }
      await sr.entities.UserSubscription.update(sub.id, updateData);
      results.push({ email: sub.email, lastEvent: r.lastEvent, status: newStatus });
    }

    return Response.json({ success: true, checked, updated, errors, results });
  } catch (error) {
    console.error('checkWelcomeEmailStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});