import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Admin-only function untuk update user info (nama, phone) dari admin dashboard.
// Guna service role sebab admin nak edit user lain — regular RLS tak benarkan.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();

    if (!me || me.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, fullName, phone } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found', email }, { status: 404 });
    }

    const updateData = {};
    if (typeof fullName === 'string' && fullName.trim()) updateData.full_name = fullName.trim();
    if (typeof phone === 'string') updateData.phone = phone.trim();

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.User.update(users[0].id, updateData);

    return Response.json({
      success: true,
      user: { id: updated.id, email: updated.email, full_name: updated.full_name, phone: updated.phone },
    });
  } catch (error) {
    console.error('adminUpdateCustomer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});