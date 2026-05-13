import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedInterval = Number(body.intervalMinutes);
    const intervalMinutes = Number.isFinite(requestedInterval)
      ? Math.max(5, Math.min(1440, Math.round(requestedInterval)))
      : null;

    const settings = await base44.asServiceRole.entities.QCSetting.list('-created_date', 1);
    let setting = settings?.[0] || null;

    if (!setting) {
      setting = await base44.asServiceRole.entities.QCSetting.create({ intervalMinutes: intervalMinutes || 10 });
    } else if (intervalMinutes) {
      setting = await base44.asServiceRole.entities.QCSetting.update(setting.id, { intervalMinutes });
    }

    return Response.json({ success: true, setting });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});