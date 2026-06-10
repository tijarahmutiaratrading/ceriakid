import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Semak status sebenar welcome email dengan Resend API ikut ALAMAT EMAIL penerima
// (bukan message ID — sebab banyak rekod lama tiada message ID).
// Kita list semua email dari Resend, cari yang dihantar ke email subscription tu,
// dan ambil status terkini (delivered / bounced / complained / sent).
//
// Payload (admin only):
//   - subscriptionId?: string  → semak satu subscription sahaja
//   - (kosong)                 → semak SEMUA subscription yang welcomeEmailStatus belum final
//
// Resend List Emails API: GET https://api.resend.com/emails

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

// Ambil senarai email dari Resend (sampai 100 terkini)
async function fetchResendEmails(RESEND_API_KEY) {
  const res = await fetch('https://api.resend.com/emails?limit=100', {
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }
  // Resend pulangkan { data: [...] }
  return Array.isArray(data?.data) ? data.data : [];
}

// Cari email terkini yang dihantar ke `email` (case-insensitive)
function findLatestForEmail(emails, email) {
  const target = String(email).toLowerCase().trim();
  const matches = emails.filter((e) => {
    const to = Array.isArray(e.to) ? e.to : [e.to];
    return to.some((addr) => String(addr).toLowerCase().trim() === target);
  });
  if (matches.length === 0) return null;
  // Susun ikut created_at descending, ambil yang paling baru
  matches.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return matches[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Benarkan dua jenis pemanggil:
    //  1. Admin yang login (semakan manual dari dashboard)
    //  2. Automation berjadual — hantar { auto: true } tanpa user context
    const body = await req.json().catch(() => ({}));
    let user = null;
    try { user = await base44.auth.me(); } catch { /* automation context — tiada user */ }
    const isAuto = body?.auto === true;
    if (!isAuto && (!user || user.role !== 'admin')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return Response.json({ error: 'Resend not configured' }, { status: 500 });
    }

    const { subscriptionId } = body;
    const sr = base44.asServiceRole;
    const nowIso = new Date().toISOString();

    // Tentukan senarai subscription untuk disemak
    let targets = [];
    if (subscriptionId) {
      const sub = await sr.entities.UserSubscription.get(subscriptionId);
      if (sub) targets = [sub];
    } else {
      const all = await sr.entities.UserSubscription.list('-created_date', 500);
      targets = all.filter(s => s.email && !FINAL_STATUSES.includes(s.welcomeEmailStatus));
    }

    // Ambil senarai email dari Resend SEKALI sahaja
    const resendEmails = await fetchResendEmails(RESEND_API_KEY);
    console.log(`Fetched ${resendEmails.length} emails from Resend`);

    let checked = 0, updated = 0, errors = 0;
    const results = [];

    for (const sub of targets) {
      if (!sub.email) {
        results.push({ email: sub.email, skipped: 'no_email' });
        continue;
      }
      checked++;
      const match = findLatestForEmail(resendEmails, sub.email);
      if (!match) {
        results.push({ email: sub.email, status: 'not_found', note: 'Tiada email dijumpai di Resend' });
        continue;
      }

      const newStatus = mapResendEvent(match.last_event);
      const updateData = {
        welcomeEmailLastCheckedAt: nowIso,
        welcomeEmailMessageId: match.id || sub.welcomeEmailMessageId,
      };
      if (newStatus !== sub.welcomeEmailStatus) {
        updateData.welcomeEmailStatus = newStatus;
        if (!sub.welcomeEmailSentAt && match.created_at) {
          updateData.welcomeEmailSentAt = match.created_at;
        }
        updated++;
      }
      await sr.entities.UserSubscription.update(sub.id, updateData);
      results.push({ email: sub.email, lastEvent: match.last_event, status: newStatus });
    }

    return Response.json({ success: true, checked, updated, errors, results });
  } catch (error) {
    console.error('checkWelcomeEmailStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});