// Shared Resend email helper
// Used by all email sending functions

export async function sendEmail({
  to, subject, html, fromName = 'CeriaKid',
}: { to: string; subject: string; html: string; fromName?: string }): Promise<{ ok: boolean; id?: string; error?: string }> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');

  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    return { ok: false, error: 'Resend not configured' };
  }

  const fromAddress = RESEND_FROM_EMAIL.includes('<')
    ? RESEND_FROM_EMAIL
    : `${fromName} <${RESEND_FROM_EMAIL}>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromAddress, to, subject, html }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.id) return { ok: true, id: data.id };
    return { ok: false, error: data?.message || `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}