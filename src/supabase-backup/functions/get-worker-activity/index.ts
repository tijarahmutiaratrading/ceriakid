// Worker activity — recent generation tasks status
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { data: tasks } = await supabaseAdmin
      .from('ck_game_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const running = (tasks || []).filter((t: any) => t.status === 'running').length;
    const pending = (tasks || []).filter((t: any) => t.status === 'pending').length;
    const completed = (tasks || []).filter((t: any) => t.status === 'completed').length;
    const failed = (tasks || []).filter((t: any) => t.status === 'failed').length;

    return jsonResponse({
      success: true,
      summary: { running, pending, completed, failed, total: tasks?.length || 0 },
      tasks: tasks || [],
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});