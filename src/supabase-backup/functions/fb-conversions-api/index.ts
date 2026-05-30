// Facebook Conversions API — server-side event tracking
// Backup untuk Pixel browser event yang block oleh iOS 14.5+ / ad-blockers
import { handleCors, jsonResponse } from '../_shared/cors.ts';

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text.toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const PIXEL_ID = Deno.env.get('FB_PIXEL_ID');
    const ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN');
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return jsonResponse({ error: 'FB CAPI not configured' }, 500);
    }

    const {
      eventName, eventID, email, phone, value, currency,
      contentName, contentIds, sourceUrl, clientIpAddress, clientUserAgent, fbp, fbc,
    } = await req.json();

    if (!eventName) return jsonResponse({ error: 'eventName required' }, 400);

    const userData: any = {};
    if (email) userData.em = [await sha256Hex(email)];
    if (phone) userData.ph = [await sha256Hex(String(phone).replace(/\D/g, ''))];
    if (clientIpAddress) userData.client_ip_address = clientIpAddress;
    if (clientUserAgent) userData.client_user_agent = clientUserAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const eventData: any = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventID || `${eventName}_${Date.now()}`,
      action_source: 'website',
      event_source_url: sourceUrl || 'https://ceriakid.com',
      user_data: userData,
      custom_data: {
        ...(currency && { currency }),
        ...(value !== undefined && { value }),
        ...(contentName && { content_name: contentName }),
        ...(contentIds && { content_ids: contentIds, content_type: 'product' }),
      },
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventData], access_token: ACCESS_TOKEN }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('FB CAPI error:', JSON.stringify(data));
      return jsonResponse({ error: 'CAPI send failed', details: data }, res.status);
    }

    return jsonResponse({ success: true, eventName, fbtraceId: data.fbtrace_id });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});