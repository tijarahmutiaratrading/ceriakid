// Reusable Resend email sender (admin or self)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { sendEmail } from '../_shared/resend.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { to, subject, html, text, fromName } = await req.json();
    if (!to || !subject || (!html && !text)) {
      return jsonResponse({ error: 'Missing required fields: to, subject, html (or text)' }, 400);
    }

    // Optional auth check — non-admin only to own email
    const user = await getUserFromRequest(req).catch(() => null);
    if (user && user.role !== 'admin' && user.email !== to) {
      return jsonResponse({ error: 'Forbidden: can only email own address' }, 403);
    }

    const result = await sendEmail({
      to,
      subject,
      html: html || text,
      fromName: fromName || 'CeriaKid',
    });

    if (!result.ok) {
      return jsonResponse({ error: 'Email send failed', details: result.error }, 500);
    }

    return jsonResponse({ success: true, emailId: result.id, to });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});