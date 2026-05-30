// Get current user's affiliate profile + referrals + payouts
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireUser } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireUser(req);
  if (guard instanceof Response) return guard;
  const { user } = guard;

  try {
    const { data: affiliates } = await supabaseAdmin
      .from('ck_affiliates')
      .select('*')
      .eq('user_email', user.email);

    if (!affiliates || affiliates.length === 0) {
      return jsonResponse({ isAffiliate: false });
    }

    const [refsRes, payoutsRes] = await Promise.all([
      supabaseAdmin
        .from('ck_affiliate_referrals')
        .select('*')
        .eq('affiliate_email', user.email)
        .order('created_at', { ascending: false })
        .limit(100),
      supabaseAdmin
        .from('ck_affiliate_payouts')
        .select('*')
        .eq('affiliate_email', user.email)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    return jsonResponse({
      isAffiliate: true,
      affiliate: affiliates[0],
      referrals: refsRes.data || [],
      payouts: payoutsRes.data || [],
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});