import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify it's the target user
    if (user?.email !== 'tijarahmutiaratrading@gmail.com') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all users and subscriptions
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const allSubs = await base44.asServiceRole.entities.UserSubscription.list('-created_date', 1000);
    
    // Delete all subs except target user
    let deletedSubCount = 0;
    for (const sub of allSubs) {
      if (sub.email !== 'tijarahmutiaratrading@gmail.com') {
        try {
          await base44.asServiceRole.entities.UserSubscription.delete(sub.id);
          deletedSubCount++;
        } catch (e) {
          console.error(`Failed to delete sub ${sub.email}:`, e);
        }
      }
    }
    
    // Delete all users except target user
    let deletedCount = 0;
    for (const u of allUsers) {
      if (u.email !== 'tijarahmutiaratrading@gmail.com') {
        try {
          await base44.asServiceRole.entities.User.delete(u.id);
          deletedCount++;
        } catch (e) {
          console.error(`Failed to delete ${u.email}:`, e);
        }
      }
    }

    // Update target user to admin
    await base44.auth.updateMe({ role: 'admin' });

    // Update subscription to pro tier (paling besar)
    await base44.asServiceRole.entities.UserSubscription.filter({ email: 'tijarahmutiaratrading@gmail.com' }).then(async (subs) => {
      if (subs.length > 0) {
        const sub = subs[0];
        await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
          tier: 'pro',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        // Create if doesn't exist
        await base44.asServiceRole.entities.UserSubscription.create({
          email: 'tijarahmutiaratrading@gmail.com',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    return Response.json({
      success: true,
      message: `✅ Deleted ${deletedSubCount} subscriptions + ${deletedCount} users. ${user.email} = admin + Pro tier.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});