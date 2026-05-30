import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Admin-only endpoint untuk update user info (nama, phone)
// Email TIDAK boleh ditukar — ia identifier utama.
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { email, fullName, phone } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Cari user mengikut email guna service role (bypass RLS)
    const matches = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });
    if (matches.length === 0) {
      return Response.json({ error: 'User not found', email }, { status: 404 });
    }

    const targetUser = matches[0];
    const updateData = {};
    if (typeof fullName === 'string' && fullName.trim()) {
      updateData.full_name = fullName.trim();
    }
    if (typeof phone === 'string') {
      updateData.phone = phone.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.User.update(targetUser.id, updateData);

    // Sync ke UserSubscription juga supaya admin dashboard & checkout form tunjuk data konsisten
    try {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ email: email.toLowerCase() });
      if (subs?.[0]) {
        const subUpdate = {};
        if (updateData.full_name) subUpdate.checkoutName = updateData.full_name;
        if (typeof updateData.phone === 'string') subUpdate.checkoutPhone = updateData.phone;
        if (Object.keys(subUpdate).length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(subs[0].id, subUpdate);
        }
      }
    } catch (syncErr) {
      console.warn('adminUpdateUser: sync to UserSubscription failed:', syncErr?.message);
    }

    return Response.json({
      success: true,
      user: { id: updated.id, email: updated.email, full_name: updated.full_name, phone: updated.phone },
    });
  } catch (error) {
    console.error('adminUpdateUser error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});