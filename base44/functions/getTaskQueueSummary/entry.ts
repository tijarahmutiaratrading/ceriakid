import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Returns TRUE counts from database (not capped by list limit).
// Query by status directly so caller gets accurate numbers.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const [pending, running, completed, failed] = await Promise.all([
      base44.asServiceRole.entities.GameTask.filter({ status: 'pending' }, '-created_date', 2000),
      base44.asServiceRole.entities.GameTask.filter({ status: 'running' }, '-created_date', 500),
      base44.asServiceRole.entities.GameTask.filter({ status: 'completed' }, '-created_date', 2000),
      base44.asServiceRole.entities.GameTask.filter({ status: 'failed' }, '-created_date', 2000),
    ]);

    const all = [...pending, ...running, ...completed, ...failed];
    const storyKid = all.reduce((acc, t) => {
      if (t.subject === 'storykid') {
        const s = t.status || 'unknown';
        acc[s] = (acc[s] || 0) + 1;
      }
      return acc;
    }, {});

    return Response.json({
      total: all.length,
      statuses: {
        pending: pending.length,
        running: running.length,
        completed: completed.length,
        failed: failed.length,
      },
      storyKid,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});