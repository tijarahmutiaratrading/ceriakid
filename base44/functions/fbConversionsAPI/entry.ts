// Facebook Conversions API (CAPI) — server-side event tracking.
// Backup untuk Pixel browser event yang block oleh iOS 14.5+ / ad-blockers.
// Dipanggil dari chipWebhook selepas payment confirmed.
//
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
//
// CRITICAL: Hash semua user data dengan SHA-256 sebelum hantar (PII compliance).

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text.toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const PIXEL_ID = Deno.env.get('FB_PIXEL_ID');
    const ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN');
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return Response.json({ error: 'FB CAPI not configured' }, { status: 500 });
    }

    const { eventName, eventID, email, phone, value, currency, contentName, contentIds, sourceUrl, clientIpAddress, clientUserAgent, fbp, fbc } = await req.json();

    if (!eventName) {
      return Response.json({ error: 'eventName required' }, { status: 400 });
    }

    // Hash PII (Meta requires SHA-256 lowercase)
    const userData = {};
    if (email) userData.em = [await sha256Hex(email)];
    if (phone) userData.ph = [await sha256Hex(phone.replace(/\D/g, ''))];
    if (clientIpAddress) userData.client_ip_address = clientIpAddress;
    if (clientUserAgent) userData.client_user_agent = clientUserAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const eventData = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventID || `${eventName}_${Date.now()}`, // dedup dengan browser pixel
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
      body: JSON.stringify({
        data: [eventData],
        access_token: ACCESS_TOKEN,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('FB CAPI error:', JSON.stringify(data));
      return Response.json({ error: 'CAPI send failed', details: data }, { status: res.status });
    }

    console.log(`FB CAPI sent: ${eventName} (id=${eventData.event_id})`);
    return Response.json({ success: true, eventName, fbtraceId: data.fbtrace_id });
  } catch (error) {
    console.error('fbConversionsAPI error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});