// Update QC settings (admin only)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const updates = await req.json();
    if (!updates || typeof updates !== 'object') {
      return jsonResponse({ error: 'Invalid payload' }, 400);
    }

    // Get or create QC settings (singleton)
    const { data: existing } = await supabaseAdmin.from('ck_qc_settings').select('*').limit(1);

    if (existing && existing.length > 0) {
      await supabaseAdmin.from('ck_qc_settings').update(updates).eq('id', existing[0].id);
    } else {
      await supabaseAdmin.from('ck_qc_settings').insert(updates);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});