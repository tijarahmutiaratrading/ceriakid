import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Dapatkan status terkini sync ke Supabase + 10 sejarah terakhir.
 * Admin-only.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

Deno.serve(async (req) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // Ambil 10 log terkini dari ck_sync_log (order by id desc)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/ck_sync_log?select=*&order=id.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: `Supabase fetch failed: ${errText.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const logs = await res.json();
    const latest = logs[0] || null;

    return Response.json({
      success: true,
      latest,
      history: logs,
      configured: true,
    });
  } catch (error) {
    console.error('getSupabaseSyncStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});