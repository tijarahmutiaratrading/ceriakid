// Health check — verify external services + database connectivity
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdminOrScheduled } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdminOrScheduled(req);
  if (guard instanceof Response) return guard;

  try {
    const checks: any[] = [];

    // 1. Database
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
      const start = Date.now();
      const res = await fetch(Deno.env.get('APP_URL') || 'https://ceriakid.com');
      checks.push({
        name: 'Landing Page',
        status: res.ok ? 'healthy' : 'warning',
        latencyMs: Date.now() - start,
        details: `HTTP ${res.status}`,
      });
    } catch (e) {
      checks.push({ name: 'Landing Page', status: 'critical', details: (e as Error).message });
    }

    // 3. CHIP API
    try {
      const start = Date.now();
      const res = await fetch('https://gate.chip-in.asia/api/v1/health/', {
        headers: { 'Authorization': `Bearer ${Deno.env.get('CHIP_SECRET_KEY')}` },
      });
      checks.push({
        name: 'CHIP API',
        status: res.status < 500 ? 'healthy' : 'warning',
        latencyMs: Date.now() - start,
        details: `HTTP ${res.status}`,
      });
    } catch (e) {
      checks.push({ name: 'CHIP API', status: 'critical', details: (e as Error).message });
    }

    // 4. Required secrets
    const required = ['CHIP_BRAND_ID', 'CHIP_SECRET_KEY', 'RESEND_API_KEY', 'VAPID_PUBLIC_KEY', 'FB_PIXEL_ID', 'OPENAI_API_KEY'];
    const missing = required.filter(k => !Deno.env.get(k));
    checks.push({
      name: 'Secrets',
      status: missing.length === 0 ? 'healthy' : 'critical',
      details: missing.length === 0 ? 'All configured' : `Missing: ${missing.join(', ')}`,
    });

    const hasCritical = checks.some(c => c.status === 'critical');
    const hasWarning = checks.some(c => c.status === 'warning');
    const overall = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';

    await supabaseAdmin.from('ck_health_check_logs').insert({
      overall_status: overall, checks, created_at: new Date().toISOString(),
    });

    // Cleanup old logs (keep last 100)
    const { data: oldLogs } = await supabaseAdmin
      .from('ck_health_check_logs')
      .select('id')
      .order('created_at', { ascending: false })
      .range(100, 1000);
    if (oldLogs && oldLogs.length > 0) {
      await supabaseAdmin.from('ck_health_check_logs').delete().in('id', oldLogs.map((l: any) => l.id));
    }

    return jsonResponse({ overall, checks, timestamp: new Date().toISOString() });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});