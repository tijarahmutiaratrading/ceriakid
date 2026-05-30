// Get current user's credit balance + last 10 transactions
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { getOrCreateCredit } from '../_shared/credits.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const credit = await getOrCreateCredit(user.email);

    const { data: transactions } = await supabaseAdmin
      .from('ck_credit_transactions')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .limit(10);

    return jsonResponse({
      balance: credit?.balance || 0,
      totalPurchased: credit?.total_purchased || 0,
      totalUsed: credit?.total_used || 0,
      lastTopUpAt: credit?.last_top_up_at,
      lastUsedAt: credit?.last_used_at,
      recentTransactions: transactions || [],
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});