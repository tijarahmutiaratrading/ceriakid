// Bulk update display names (writes to display_name, not full_name)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { updates } = await req.json();
    if (!Array.isArray(updates)) {
      return jsonResponse({ error: 'updates must be an array' }, 400);
    }

    const results = [];
    for (const { email, full_name } of updates) {
      try {
        const { data: users } = await supabaseAdmin.from('ck_users').select('id').eq('email', email);
        if (users && users.length > 0) {
          await supabaseAdmin.from('ck_users').update({ display_name: full_name }).eq('id', users[0].id);
          results.push({ email, success: true });
        } else {
          results.push({ email, success: false, error: 'User not found' });
        }
      } catch (err: any) {
        results.push({ email, success: false, error: err.message });
      }
    }

    return jsonResponse({ results });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});