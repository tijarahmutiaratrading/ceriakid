import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email } = await req.json();

    // Update user subscription with full access
    const existing = await base44.asServiceRole.entities.UserSubscription.filter({
      email: email
    });

    if (existing.length === 0) {
      return Response.json({ error: 'User subscription not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
      tier: 'premium',
      status: 'active',
      maxChildren: 4,
      unlockedSubjects: ['bahasa_melayu', 'english', 'mathematics', 'science'],
      unlockedLevels: ['prasekolah', 'sekolah_rendah']
    });

    return Response.json({ 
      message: `${email} has full premium access: all subjects, all levels, 4 children`, 
      updated: true 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});