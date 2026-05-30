// Admin: update affiliate status / commission rates
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { affiliateId, status, commissionRateSubscription, commissionRateCredit } = await req.json();
    if (!affiliateId) return jsonResponse({ error: 'Missing affiliateId' }, 400);

    const update: any = {};
    if (status !== undefined) update.status = status;
    if (commissionRateSubscription !== undefined) update.commission_rate_subscription = Number(commissionRateSubscription);
    if (commissionRateCredit !== undefined) update.commission_rate_credit = Number(commissionRateCredit);

    await supabaseAdmin.from('ck_affiliates').update(update).eq('id', affiliateId);
    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});