// Background scheduled story generator — calls launch-generate-story-kid
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const { data: settings } = await supabaseAdmin.from('ck_qc_settings').select('*').limit(1);
    const setting = settings?.[0];
    if (!setting?.background_story_enabled) {
      return jsonResponse({ success: true, skipped: true, reason: 'disabled' });
    }

    const targetCap = setting?.story_kid_cap || 30;

    const { count } = await supabaseAdmin
      .from('ck_games')
      .select('id', { count: 'exact', head: true })
      .eq('category', 'story').eq('is_published', true);

    if ((count || 0) >= targetCap) {
      if (setting?.id) await supabaseAdmin.from('ck_qc_settings').update({ background_story_enabled: false }).eq('id', setting.id);
      return jsonResponse({ success: true, allComplete: true, count });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_KEY');
    const res = await fetch(`${SUPABASE_URL}/functions/v1/launch-generate-story-kid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
      body: JSON.stringify({ targetCount: targetCap }),
    });
    const data = await res.json();

    return jsonResponse({
      success: true,
      generated: data?.generated || 0,
      failed: data?.failed || 0,
      total: (count || 0) + (data?.generated || 0),
      target: targetCap,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});