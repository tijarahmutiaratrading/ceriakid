import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    
    return Response.json({
      totalUsers: users.length,
      users: users.map(u => ({
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        created_date: u.created_date
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});