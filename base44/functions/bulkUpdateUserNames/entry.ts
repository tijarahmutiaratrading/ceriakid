import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { updates } = await req.json();
    if (!Array.isArray(updates)) {
      return Response.json({ error: 'updates must be an array' }, { status: 400 });
    }

    // NOTE: full_name is platform-protected (RLS) — we write to displayName instead.
    // displayName is admin-editable and shown in admin views via getCustomerDetails.
    const results = [];
    for (const { email, full_name } of updates) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, { displayName: full_name });
          results.push({ email, success: true });
        } else {
          results.push({ email, success: false, error: 'User not found (cannot create — users register via login)' });
        }
      } catch (err) {
        results.push({ email, success: false, error: err.message });
      }
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});