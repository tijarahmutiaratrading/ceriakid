// Add credits — admin or self (self only when type=admin_adjustment by admin)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { addCredits } from '../_shared/credits.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const caller = await getUserFromRequest(req);
    if (!caller) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { userEmail, amount, type, description, referenceId, metadata } = await req.json();
    if (!amount || amount <= 0) return jsonResponse({ error: 'Invalid amount' }, 400);
    if (!type) return jsonResponse({ error: 'Type required' }, 400);

    const targetEmail = userEmail || caller.email;
    if (targetEmail !== caller.email && caller.role !== 'admin') {
      return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
    }

    const feature = type === 'purchase' ? 'top_up' : (type === 'bonus' ? 'bonus' : 'admin');
    const result = await addCredits(targetEmail, amount, type, feature,
      description || `Tambah ${amount} kredit (${type})`,
      referenceId || '', metadata || {});

    return jsonResponse({ success: true, userEmail: targetEmail, newBalance: result.newBalance, amountAdded: amount });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});