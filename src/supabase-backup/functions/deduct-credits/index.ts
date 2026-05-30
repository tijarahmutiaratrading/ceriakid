// Deduct credits — user only
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { deductCredits } from '../_shared/credits.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { amount, feature, description, metadata } = await req.json();
    if (!amount || amount <= 0) return jsonResponse({ error: 'Invalid amount' }, 400);
    if (!feature) return jsonResponse({ error: 'Feature required' }, 400);

    const result = await deductCredits(user.email, amount, feature,
      description || `Penggunaan ${feature}`, metadata || {});

    if (!result.ok) {
      return jsonResponse({
        success: false, error: 'INSUFFICIENT_CREDITS',
        balance: result.newBalance, required: amount,
      }, 402);
    }
    return jsonResponse({ success: true, newBalance: result.newBalance, amountDeducted: amount });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});