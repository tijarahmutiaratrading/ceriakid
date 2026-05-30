// Simple health check — verify external services reachable
// Replaces the complex Base44 version with the same intent
import { jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  try {
    // Admin OR scheduled
    let isScheduled = false;
    try {
      const body = await req.clone().json();
      if (body?.scheduled === true || body?.automation?.type === 'scheduled') isScheduled = true;
    } catch {}

    if (!isScheduled) {
      const user = await getUserFromRequest(req);
      if (!user || user.role !== 'admin') {
        return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
      }
    }

    const checks: any[] = [];

    // 1. Database connectivity
    const dbStart = Date.now();
    const { error: dbErr } = await supabaseAdmin.from('ck_users').select('id').limit(1);
    checks.push({
      name: 'Database',
      status: dbErr ? 'critical' : 'healthy',
      latencyMs: Date.now() - dbStart,
      details: dbErr?.message || 'OK',
    });

    // 2. Landing page
    try {
      const lpStart = Date.now();
      const lpRes = await fetch(Deno.env.get('APP_URL') || 'https://ceriakid.com');
      checks.push({
        name: 'Landing Page',
        status: lpRes.ok ? 'healthy' : 'warning',
        latencyMs: Date.now() - lpStart,
        details: `HTTP ${lpRes.status}`,
      });
    } catch (e) {
      checks.push({ name: 'Landing Page', status: 'critical', details: e.message });
    }

    // 3. CHIP API
    try {
      const chipStart = Date.now();
      const chipRes = await fetch('https://gate.chip-in.asia/api/v1/health/', {
        headers: { 'Authorization': `Bearer ${Deno.env.get('CHIP_SECRET_KEY')}` },
      });
      checks.push({
        name: 'CHIP API',
        status: chipRes.status < 500 ? 'healthy' : 'warning',
        latencyMs: Date.now() - chipStart,
        details: `HTTP ${chipRes.status}`,
      });
    } catch (e) {
      checks.push({ name: 'CHIP API', status: 'critical', details: e.message });
    }

    // 4. Secrets configured
    const requiredSecrets = ['CHIP_BRAND_ID', 'CHIP_SECRET_KEY', 'RESEND_API_KEY', 'VAPID_PUBLIC_KEY', 'FB_PIXEL_ID'];
    const missing = requiredSecrets.filter(k => !Deno.env.get(k));
    checks.push({
      name: 'Secrets',
      status: missing.length === 0 ? 'healthy' : 'critical',
      details: missing.length === 0 ? 'All configured' : `Missing: ${missing.join(', ')}`,
    });

    // Overall status
    const hasCritical = checks.some(c => c.status === 'critical');
    const hasWarning = checks.some(c => c.status === 'warning');
    const overall = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';

    // Log result
    await supabaseAdmin.from('ck_health_check_logs').insert({
      overall_status: overall,
      checks,
      created_at: new Date().toISOString(),
    });

    // Cleanup old logs (keep last 100)
    const { data: oldLogs } = await supabaseAdmin
      .from('ck_health_check_logs')
      .select('id')
      .order('created_at', { ascending: false })
      .range(100, 1000);

    if (oldLogs && oldLogs.length > 0) {
      await supabaseAdmin
        .from('ck_health_check_logs')
        .delete()
        .in('id', oldLogs.map((l: any) => l.id));
    }

    return jsonResponse({ overall, checks, timestamp: new Date().toISOString() });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});