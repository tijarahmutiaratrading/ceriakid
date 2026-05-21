import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Jalankan semua health checks untuk CeriaKid + simpan log
// Boleh dipanggil manually dari admin dashboard atau scheduled setiap 15 minit
Deno.serve(async (req) => {
  const startTime = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const isScheduled = body.scheduled === true;

    // Kalau dipanggil manually dari admin, verify admin
    if (!isScheduled) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
      }
    }

    const checks = [];
    const origin = new URL(req.url).origin;

    // ───────────────────────────────────────────────
    // 1. LANDING PAGE UPTIME — check Base44 public CDN where app actually served
    // ───────────────────────────────────────────────
    try {
      const appId = Deno.env.get('BASE44_APP_ID');
      const publicUrl = `https://app.base44.com/api/apps/public/prod/public-settings/by-id/${appId}`;
      const t0 = Date.now();
      const res = await fetch(publicUrl);
      const latency = Date.now() - t0;
      if (res.ok && latency < 5000) {
        checks.push({ key: 'landing_uptime', label: 'Landing Page Uptime', status: 'healthy', message: `App reachable & settings loaded`, value: `${latency}ms`, category: 'Frontend' });
      } else if (res.ok) {
        checks.push({ key: 'landing_uptime', label: 'Landing Page Uptime', status: 'warning', message: `App slow (${latency}ms > 5s)`, value: `${latency}ms`, category: 'Frontend' });
      } else {
        checks.push({ key: 'landing_uptime', label: 'Landing Page Uptime', status: 'critical', message: `App settings HTTP ${res.status}`, value: `${res.status}`, category: 'Frontend' });
      }
    } catch (e) {
      checks.push({ key: 'landing_uptime', label: 'Landing Page Uptime', status: 'critical', message: `Connection failed: ${e.message}`, value: 'error', category: 'Frontend' });
    }

    // ───────────────────────────────────────────────
    // 2. CHIP PAYMENT GATEWAY — payment server reachable
    // ───────────────────────────────────────────────
    try {
      const secretKey = Deno.env.get('CHIP_SECRET_KEY');
      const brandId = Deno.env.get('CHIP_BRAND_ID');
      if (!secretKey || !brandId) {
        checks.push({ key: 'chip_gateway', label: 'Chip Payment Gateway', status: 'critical', message: 'CHIP credentials tidak diset', value: 'missing', category: 'Payment' });
      } else {
        const t0 = Date.now();
        // Ping Chip API. Logic: ANY response (200/400/404) = server UP. Only auth fail (401/403)
        // or 5xx server error = real problem. Connection drop = critical.
        const res = await fetch(`https://gate.chip-in.asia/api/v1/account/json/`, {
          headers: { 'Authorization': `Bearer ${secretKey}` }
        });
        const latency = Date.now() - t0;
        if (res.status === 401 || res.status === 403) {
          checks.push({ key: 'chip_gateway', label: 'Chip Payment Gateway', status: 'critical', message: `API key invalid (HTTP ${res.status})`, value: `${res.status}`, category: 'Payment' });
        } else if (res.status >= 500) {
          checks.push({ key: 'chip_gateway', label: 'Chip Payment Gateway', status: 'critical', message: `Chip server down (HTTP ${res.status})`, value: `${res.status}`, category: 'Payment' });
        } else {
          // 2xx, 3xx, 4xx — server is reachable
          checks.push({ key: 'chip_gateway', label: 'Chip Payment Gateway', status: 'healthy', message: 'Payment gateway server reachable', value: `${latency}ms`, category: 'Payment' });
        }
      }
    } catch (e) {
      checks.push({ key: 'chip_gateway', label: 'Chip Payment Gateway', status: 'critical', message: `Connection failed: ${e.message}`, value: 'error', category: 'Payment' });
    }

    // ───────────────────────────────────────────────
    // 3. WEBHOOK HEALTH — ada payment masuk dalam 24 jam?
    // ───────────────────────────────────────────────
    try {
      const subs = await base44.asServiceRole.entities.UserSubscription.list('-currentPeriodStart', 50);
      const now = Date.now();
      const recentPaid = subs.filter(s => {
        if (s.status !== 'active' || s.tier === 'free') return false;
        const startTime = new Date(s.currentPeriodStart || s.created_date).getTime();
        return (now - startTime) < 24 * 60 * 60 * 1000;
      });
      const stuckIncomplete = subs.filter(s => {
        if (s.status !== 'incomplete') return false;
        const updated = new Date(s.updated_date || s.created_date).getTime();
        return (now - updated) > 60 * 60 * 1000; // > 1 jam
      });
      if (stuckIncomplete.length > 5) {
        checks.push({ key: 'webhook_health', label: 'Webhook Health', status: 'warning', message: `${stuckIncomplete.length} subscription stuck di 'incomplete' > 1 jam`, value: `${stuckIncomplete.length} stuck`, category: 'Payment' });
      } else {
        checks.push({ key: 'webhook_health', label: 'Webhook Health', status: 'healthy', message: `${recentPaid.length} pembelian 24 jam terakhir`, value: `${recentPaid.length} paid / 24j`, category: 'Payment' });
      }
    } catch (e) {
      checks.push({ key: 'webhook_health', label: 'Webhook Health', status: 'warning', message: `Cannot check: ${e.message}`, value: 'error', category: 'Payment' });
    }

    // ───────────────────────────────────────────────
    // 4. FB PIXEL TRACKING
    // ───────────────────────────────────────────────
    const pixelId = Deno.env.get('FB_PIXEL_ID');
    const fbAccessToken = Deno.env.get('FB_ACCESS_TOKEN');
    if (pixelId && fbAccessToken) {
      checks.push({ key: 'fb_pixel', label: 'FB Pixel Tracking', status: 'healthy', message: 'Pixel ID & CAPI token diset', value: `ID: ${pixelId.slice(0, 6)}...`, category: 'Analytics' });
    } else if (pixelId) {
      checks.push({ key: 'fb_pixel', label: 'FB Pixel Tracking', status: 'warning', message: 'Pixel ID set, tetapi CAPI access token tiada', value: 'partial', category: 'Analytics' });
    } else {
      checks.push({ key: 'fb_pixel', label: 'FB Pixel Tracking', status: 'critical', message: 'FB_PIXEL_ID tidak diset — iklan tak track', value: 'missing', category: 'Analytics' });
    }

    // ───────────────────────────────────────────────
    // 5. GAME CONTENT QUALITY — ambil QC log terkini
    // ───────────────────────────────────────────────
    try {
      const qcLogs = await base44.asServiceRole.entities.QCLog.list('-runAt', 1);
      const latest = qcLogs?.[0];
      if (!latest) {
        checks.push({ key: 'game_quality', label: 'Game Content Quality', status: 'warning', message: 'Belum ada QC audit log', value: 'no data', category: 'Content' });
      } else {
        const score = Number(latest.score || 0);
        const ageMin = (Date.now() - new Date(latest.runAt).getTime()) / 60000;
        if (ageMin > 60) {
          checks.push({ key: 'game_quality', label: 'Game Content Quality', status: 'warning', message: `QC tak run dalam ${Math.round(ageMin)} minit`, value: `${score}%`, category: 'Content' });
        } else if (score >= 90) {
          checks.push({ key: 'game_quality', label: 'Game Content Quality', status: 'healthy', message: `QC score ${score}% — content sihat`, value: `${score}%`, category: 'Content' });
        } else if (score >= 75) {
          checks.push({ key: 'game_quality', label: 'Game Content Quality', status: 'warning', message: `QC score ${score}% — perlu repair`, value: `${score}%`, category: 'Content' });
        } else {
          checks.push({ key: 'game_quality', label: 'Game Content Quality', status: 'critical', message: `QC score ${score}% — banyak content rosak`, value: `${score}%`, category: 'Content' });
        }
      }
    } catch (e) {
      checks.push({ key: 'game_quality', label: 'Game Content Quality', status: 'warning', message: `Cannot read QC logs: ${e.message}`, value: 'error', category: 'Content' });
    }

    // ───────────────────────────────────────────────
    // 6. TASK QUEUE HEALTH — pending/failed tasks
    // ───────────────────────────────────────────────
    try {
      const tasks = await base44.asServiceRole.entities.GameTask.list('-created_date', 200);
      const pending = tasks.filter(t => t.status === 'pending').length;
      const running = tasks.filter(t => t.status === 'running').length;
      const failed = tasks.filter(t => t.status === 'failed').length;
      if (failed > 10) {
        checks.push({ key: 'task_queue', label: 'Task Queue Health', status: 'warning', message: `${failed} task gagal — perlu siasat`, value: `${failed} failed`, category: 'Content' });
      } else if (pending > 50) {
        checks.push({ key: 'task_queue', label: 'Task Queue Health', status: 'warning', message: `Queue backlog: ${pending} pending`, value: `${pending} pending`, category: 'Content' });
      } else {
        checks.push({ key: 'task_queue', label: 'Task Queue Health', status: 'healthy', message: `Queue normal — ${pending} pending, ${running} running`, value: `${pending}p / ${running}r`, category: 'Content' });
      }
    } catch (e) {
      checks.push({ key: 'task_queue', label: 'Task Queue Health', status: 'warning', message: `Cannot read tasks: ${e.message}`, value: 'error', category: 'Content' });
    }

    // ───────────────────────────────────────────────
    // 7. DATABASE HEALTH — Game entity reachable
    // ───────────────────────────────────────────────
    try {
      const t0 = Date.now();
      const games = await base44.asServiceRole.entities.Game.list('-created_date', 1);
      const latency = Date.now() - t0;
      if (games && latency < 3000) {
        checks.push({ key: 'db_health', label: 'Database Health', status: 'healthy', message: `Database responsive`, value: `${latency}ms`, category: 'Infrastructure' });
      } else {
        checks.push({ key: 'db_health', label: 'Database Health', status: 'warning', message: `Database slow (${latency}ms)`, value: `${latency}ms`, category: 'Infrastructure' });
      }
    } catch (e) {
      checks.push({ key: 'db_health', label: 'Database Health', status: 'critical', message: `Database error: ${e.message}`, value: 'error', category: 'Infrastructure' });
    }

    // ───────────────────────────────────────────────
    // 8. USER GROWTH HEALTH
    // ───────────────────────────────────────────────
    try {
      const allSubs = await base44.asServiceRole.entities.UserSubscription.list('-created_date', 500);
      const total = allSubs.length;
      const paid = allSubs.filter(s => s.status === 'active' && s.tier !== 'free').length;
      checks.push({ key: 'user_health', label: 'User Base', status: 'healthy', message: `${total} pelanggan terdaftar, ${paid} berbayar`, value: `${total} total / ${paid} paid`, category: 'Business' });
    } catch (e) {
      checks.push({ key: 'user_health', label: 'User Base', status: 'warning', message: `Cannot read users: ${e.message}`, value: 'error', category: 'Business' });
    }

    // ───────────────────────────────────────────────
    // Summary
    // ───────────────────────────────────────────────
    const healthyCount = checks.filter(c => c.status === 'healthy').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    const criticalCount = checks.filter(c => c.status === 'critical').length;
    const overallStatus = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'healthy';
    const durationMs = Date.now() - startTime;

    const log = await base44.asServiceRole.entities.HealthCheckLog.create({
      runAt: new Date().toISOString(),
      overallStatus,
      totalChecks: checks.length,
      healthyCount,
      warningCount,
      criticalCount,
      durationMs,
      checks,
    });

    // Auto-cleanup logs lama (keep last 100)
    try {
      const allLogs = await base44.asServiceRole.entities.HealthCheckLog.list('-runAt', 200);
      if (allLogs.length > 100) {
        const toDelete = allLogs.slice(100);
        for (const old of toDelete) {
          await base44.asServiceRole.entities.HealthCheckLog.delete(old.id);
        }
      }
    } catch {}

    // ───────────────────────────────────────────────
    // Email alert kalau status warning/critical (cooldown 6 jam supaya tak spam)
    // ───────────────────────────────────────────────
    if (isScheduled && (overallStatus === 'critical' || overallStatus === 'warning')) {
      try {
        // Cari log sebelum ni — kalau dah hantar alert dalam 6 jam lepas, skip
        const recentLogs = await base44.asServiceRole.entities.HealthCheckLog.list('-runAt', 20);
        const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
        const recentAlerts = recentLogs.filter(l => {
          if (l.id === log.id) return false;
          const runTime = new Date(l.runAt).getTime();
          return runTime > sixHoursAgo && (l.overallStatus === 'critical' || l.overallStatus === 'warning');
        });

        if (recentAlerts.length === 0) {
          // Cari admin emails
          const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
          const adminEmails = (admins || []).map(a => a.email).filter(Boolean);

          if (adminEmails.length > 0) {
            const issueRows = checks
              .filter(c => c.status === 'warning' || c.status === 'critical')
              .map(c => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;"><strong>${c.label}</strong><br/><span style="color:#666;font-size:12px;">${c.category}</span></td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><span style="background:${c.status === 'critical' ? '#fee2e2' : '#fef3c7'};color:${c.status === 'critical' ? '#991b1b' : '#92400e'};padding:3px 8px;border-radius:6px;font-size:11px;font-weight:bold;">${c.status.toUpperCase()}</span></td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#444;font-size:13px;">${c.message}</td></tr>`)
              .join('');

            const statusEmoji = overallStatus === 'critical' ? '🚨' : '⚠️';
            const statusLabel = overallStatus === 'critical' ? 'CRITICAL' : 'WARNING';
            const statusColor = overallStatus === 'critical' ? '#dc2626' : '#d97706';

            const body = `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:${statusColor};color:white;padding:20px;border-radius:12px 12px 0 0;">
                <h1 style="margin:0;font-size:22px;">${statusEmoji} CeriaKid System Alert</h1>
                <p style="margin:5px 0 0;opacity:0.9;font-size:14px;">Status: <strong>${statusLabel}</strong> · ${criticalCount} critical, ${warningCount} warning</p>
              </div>
              <div style="background:white;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;padding:20px;">
                <p style="color:#333;margin:0 0 15px;">Health audit dijalankan pada <strong>${new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</strong> menemui isu berikut:</p>
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                  <thead><tr style="background:#f9fafb;"><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;">Check</th><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;">Status</th><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;">Detail</th></tr></thead>
                  <tbody>${issueRows}</tbody>
                </table>
                <div style="margin-top:20px;padding-top:15px;border-top:1px solid #eee;text-align:center;">
                  <a href="https://app.base44.com" style="background:#7c3aed;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">Buka Admin Dashboard</a>
                </div>
                <p style="color:#888;font-size:11px;margin-top:20px;text-align:center;">Email seterusnya hanya dihantar kalau masalah masih wujud selepas 6 jam.</p>
              </div>
            </div>`;

            for (const email of adminEmails) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: email,
                subject: `${statusEmoji} CeriaKid ${statusLabel}: ${criticalCount} critical, ${warningCount} warning`,
                body,
              });
            }
          }
        }
      } catch (e) {
        console.error('Failed to send health alert email:', e);
      }
    }

    return Response.json({
      success: true,
      logId: log.id,
      overallStatus,
      totalChecks: checks.length,
      healthyCount,
      warningCount,
      criticalCount,
      durationMs,
      checks,
    });
  } catch (error) {
    console.error('runHealthCheck error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});