// Admin: approve / reject / complete affiliate payout
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { payoutId, action, transactionRef, adminNote } = await req.json();
    if (!payoutId || !action) return jsonResponse({ error: 'Missing fields' }, 400);

    const { data: payouts } = await supabaseAdmin
      .from('ck_affiliate_payouts')
      .select('*')
      .eq('id', payoutId);

    if (!payouts || payouts.length === 0) {
      return jsonResponse({ error: 'Payout tidak dijumpai' }, 404);
    }
    const p = payouts[0];

    const { data: affs } = await supabaseAdmin
      .from('ck_affiliates')
      .select('*')
      .eq('user_email', p.affiliate_email);
    const affiliate = affs?.[0];

    if (action === 'complete') {
      await supabaseAdmin.from('ck_affiliate_payouts').update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        transaction_ref: transactionRef || '',
        admin_note: adminNote || '',
      }).eq('id', p.id);

      if (affiliate) {
        await supabaseAdmin.from('ck_affiliates').update({
          total_paid_out: (affiliate.total_paid_out || 0) + (p.amount_myr || 0),
        }).eq('id', affiliate.id);
      }

      // Mark approved referrals as paid
      await supabaseAdmin.from('ck_affiliate_referrals').update({
        status: 'paid',
        payout_id: p.id,
      }).eq('affiliate_email', p.affiliate_email).eq('status', 'approved');

    } else if (action === 'reject') {
      await supabaseAdmin.from('ck_affiliate_payouts').update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        admin_note: adminNote || '',
      }).eq('id', p.id);

      if (affiliate) {
        await supabaseAdmin.from('ck_affiliates').update({
          pending_balance: (affiliate.pending_balance || 0) + (p.amount_myr || 0),
        }).eq('id', affiliate.id);
      }
    } else if (action === 'processing') {
      await supabaseAdmin.from('ck_affiliate_payouts').update({
        status: 'processing',
        admin_note: adminNote || '',
      }).eq('id', p.id);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});