// Update affiliate bank info
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
    const { bankName, bankAccountNumber, bankAccountHolder, phone } = await req.json();

    const { data: affs } = await supabaseAdmin
      .from('ck_affiliates')
      .select('id')
      .eq('user_email', user.email);

    if (!affs || affs.length === 0) return jsonResponse({ error: 'Bukan affiliate' }, 404);

    const update: any = {};
    if (bankName !== undefined) update.bank_name = bankName;
    if (bankAccountNumber !== undefined) update.bank_account_number = bankAccountNumber;
    if (bankAccountHolder !== undefined) update.bank_account_holder = bankAccountHolder;
    if (phone !== undefined) update.phone = phone;

    await supabaseAdmin.from('ck_affiliates').update(update).eq('id', affs[0].id);
    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});