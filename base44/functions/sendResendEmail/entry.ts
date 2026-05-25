import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Reusable Resend email sender.
 * 
 * Usage from frontend:
 *   await base44.functions.invoke('sendResendEmail', {
 *     to: 'user@email.com',
 *     subject: 'Hello',
 *     html: '<h1>Hi</h1>',
 *   });
 * 
 * Usage from other backend functions:
 *   await base44.functions.invoke('sendResendEmail', { to, subject, html });
 * 
 * Auth:
 * - If called by an admin user → allowed
 * - If called by a regular user → only allowed to send to their own email
 * - If called server-to-server (no user) → allowed (trusted internal use)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { to, subject, html, text, fromName } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return Response.json(
        { error: 'Missing required fields: to, subject, html (or text)' },
        { status: 400 }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');

    if (!RESEND_API_KEY) {
      return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }
    if (!RESEND_FROM_EMAIL) {
      return Response.json({ error: 'RESEND_FROM_EMAIL not configured' }, { status: 500 });
    }

    // Optional auth check — non-admin users can only email themselves
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_e) {
      // No user context (server-to-server call) — allow
    }

    if (user && user.role !== 'admin' && user.email !== to) {
      return Response.json(
        { error: 'Forbidden: you can only send email to your own address' },
        { status: 403 }
      );
    }

    // Build from header — prefer caller-provided fromName, else use env value as-is
    const from = fromName
      ? `${fromName} <${extractEmail(RESEND_FROM_EMAIL)}>`
      : RESEND_FROM_EMAIL;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      }),
    });

    const responseData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', responseData);
      return Response.json(
        { error: 'Email send failed', details: responseData },
        { status: resendResponse.status }
      );
    }

    return Response.json({
      success: true,
      emailId: responseData.id,
      to,
    });
  } catch (error) {
    console.error('sendResendEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Extract plain email from "Name <email@x.com>" format, or return as-is
function extractEmail(fromString) {
  const match = fromString.match(/<(.+)>/);
  return match ? match[1] : fromString;
}