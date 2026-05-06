import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 500);

    const summary = tasks.reduce((acc, task) => {
      const status = task.status || 'unknown';
      acc.statuses[status] = (acc.statuses[status] || 0) + 1;
      acc.total += 1;
      if (task.subject === 'storykid') acc.storyKid[status] = (acc.storyKid[status] || 0) + 1;
      return acc;
    }, { total: 0, statuses: {}, storyKid: {} });

    return Response.json(summary);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});