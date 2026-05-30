// Admin update user (name, phone). Email not changeable.
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { email, fullName, phone } = await req.json();
    if (!email) return jsonResponse({ error: 'Email required' }, 400);

    const { data: users } = await supabaseAdmin
      .from('ck_users')
      .select('*')
      .eq('email', email.toLowerCase());

    if (!users || users.length === 0) {
      return jsonResponse({ error: 'User not found', email }, 404);
    }

    const updateData: any = {};
    if (typeof fullName === 'string' && fullName.trim()) updateData.full_name = fullName.trim();
    if (typeof phone === 'string') updateData.phone = phone.trim();

    if (Object.keys(updateData).length === 0) {
      return jsonResponse({ error: 'No fields to update' }, 400);
    }

    const { data: updated } = await supabaseAdmin
      .from('ck_users')
      .update(updateData)
      .eq('id', users[0].id)
      .select()
      .single();

    // Sync to UserSubscription
    if (updateData.full_name || typeof updateData.phone === 'string') {
      const subUpdate: any = {};
      if (updateData.full_name) subUpdate.checkout_name = updateData.full_name;
      if (typeof updateData.phone === 'string') subUpdate.checkout_phone = updateData.phone;
      await supabaseAdmin.from('ck_user_subscriptions').update(subUpdate).eq('email', email.toLowerCase());
    }

    return jsonResponse({
      success: true,
      user: { id: updated.id, email: updated.email, full_name: updated.full_name, phone: updated.phone },
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});