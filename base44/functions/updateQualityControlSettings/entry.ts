import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const clampInt = (value, min, max) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n)));
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const intervalMinutes = clampInt(body.intervalMinutes, 5, 1440);
    const subjectCap = clampInt(body.subjectCap, 4, 200);
    const miniGameCap = clampInt(body.miniGameCap, 4, 200);
    const storyKidCap = clampInt(body.storyKidCap, 4, 200);

    const settings = await base44.asServiceRole.entities.QCSetting.list('-created_date', 1);
    let setting = settings?.[0] || null;

    const updates = {};
    if (intervalMinutes !== null) updates.intervalMinutes = intervalMinutes;
    if (subjectCap !== null) updates.subjectCap = subjectCap;
    if (miniGameCap !== null) updates.miniGameCap = miniGameCap;
    if (storyKidCap !== null) updates.storyKidCap = storyKidCap;

    if (!setting) {
      setting = await base44.asServiceRole.entities.QCSetting.create({
        intervalMinutes: intervalMinutes || 10,
        subjectCap: subjectCap || 30,
        miniGameCap: miniGameCap || 30,
        storyKidCap: storyKidCap || 30,
      });
    } else if (Object.keys(updates).length > 0) {
      setting = await base44.asServiceRole.entities.QCSetting.update(setting.id, updates);
    }

    return Response.json({ success: true, setting });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});