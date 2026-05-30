// User registers as affiliate — auto-generate unique referral code
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
    const { fullName, phone, bankName, bankAccountNumber, bankAccountHolder } = await req.json();
    if (!fullName || !phone) {
      return jsonResponse({ error: 'Sila lengkapkan nama dan telefon' }, 400);
    }

    const { data: existing } = await supabaseAdmin
      .from('ck_affiliates')
      .select('*')
      .eq('user_email', user.email);

    if (existing && existing.length > 0) {
      return jsonResponse({ error: 'Anda sudah menjadi affiliate', affiliate: existing[0] }, 400);
    }

    // Generate unique code
    const baseName = (fullName.split(' ')[0] || 'user').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6) || 'USER';
    let code = '';
    for (let i = 0; i < 10; i++) {
      const candidate = `${baseName}${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: dupe } = await supabaseAdmin.from('ck_affiliates').select('id').eq('referral_code', candidate);
      if (!dupe || dupe.length === 0) { code = candidate; break; }
    }
    if (!code) code = `REF${Date.now().toString().slice(-8)}`;

    const { data: created } = await supabaseAdmin
      .from('ck_affiliates')
      .insert({
        user_email: user.email,
        full_name: fullName,
        phone,
        referral_code: code,
        status: 'active',
        tier: 'bronze',
        commission_rate_subscription: 20,
        commission_rate_credit: 15,
        total_referrals: 0,
        total_earned: 0,
        total_paid_out: 0,
        pending_balance: 0,
        bank_name: bankName || '',
        bank_account_number: bankAccountNumber || '',
        bank_account_holder: bankAccountHolder || '',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    return jsonResponse({ success: true, affiliate: created });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});