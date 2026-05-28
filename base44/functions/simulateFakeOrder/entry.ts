import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import webpush from 'npm:web-push@3.6.7';

// Admin-only full-flow purchase simulator. Triggers ALL the side effects directly
// (Resend email + Web Push) so admin can verify everything works end-to-end without
// relying on cross-function-invoke (which has auth context issues).
//
// Payload:
//   - type: 'subscription' | 'credit' (default 'subscription')
//   - tier: 'asas' | 'standard' | 'keluarga' (for subscription)
//   - credits: number (for credit, default 50)
//   - targetEmail: string (optional — default admin's own email)
//   - dryRun: boolean (default false) — kalau true, tak hantar email & tak ubah state
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const type = body.type || 'subscription';
    const tier = body.tier || 'keluarga';
    const credits = body.credits || 50;
    const targetEmail = body.targetEmail || user.email;
    const dryRun = body.dryRun === true;

    const report = {
      type,
      targetEmail,
      dryRun,
      startedAt: new Date().toISOString(),
      steps: [],
    };

    const log = (step, status, detail) => {
      report.steps.push({ step, status, detail, at: new Date().toISOString() });
      console.log(`[SIMULATE] ${step}: ${status} — ${detail || ''}`);
    };

    // ─── STEP 1: Welcome Email (call sendWelcomeEmail via cross-function-invoke,
    // SAMA seperti chipWebhook supaya kita betul-betul test production path) ───
    try {
      if (dryRun) {
        log('welcome_email', 'skipped', 'dry-run mode');
      } else {
        const emailPayload = type === 'credit'
          ? { to: targetEmail, type: 'credit', credits }
          : { to: targetEmail, type: 'subscription', tier, bonusCredits: { asas: 5, standard: 20, keluarga: 50 }[tier] || 0 };

        const r = await base44.asServiceRole.functions.invoke('sendWelcomeEmail', emailPayload);
        const ok = r?.data?.success;
        log('welcome_email', ok ? 'sent' : 'failed',
          ok ? `emailId=${r.data.emailId}` : JSON.stringify(r?.data || r?.status || r));
      }
    } catch (err) {
      log('welcome_email', 'error', err?.message || String(err));
    }

    // ─── STEP 2: Admin Push Notification (sama — via cross-invoke) ───
    try {
      const pushTitle = type === 'credit'
        ? '💰 Credit Top-Up Baru! (TEST)'
        : '🎉 Subscription Baru! (TEST)';
      const pushBody = type === 'credit'
        ? `${targetEmail} beli ${credits} kredit — TEST`
        : `${targetEmail} langgan pelan ${tier.toUpperCase()} — TEST`;

      const r = await base44.asServiceRole.functions.invoke('sendPushNotification', {
        title: pushTitle,
        body: pushBody,
        url: '/admin-dashboard?tab=analytics',
        tag: 'fake-order-test',
      });
      const ok = r?.data?.success;
      log('admin_push', ok ? 'sent' : 'failed',
        ok ? `sent=${r.data.sent || 0}, failed=${r.data.failed || 0}, message=${r.data.message || ''}` : JSON.stringify(r?.data || r?.status || r));
    } catch (err) {
      log('admin_push', 'error', err?.message || String(err));
    }

    // ─── STEP 3: Direct Resend Test (bypass cross-invoke, panggil terus Resend API)
    // Ini test KALAU Resend dah configured betul, tak kira cross-invoke. ───
    if (!dryRun) {
      try {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
        if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
          log('resend_direct', 'missing', 'Resend env tidak set');
        } else {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: RESEND_FROM_EMAIL.includes('<') ? RESEND_FROM_EMAIL : `CeriaKid <${RESEND_FROM_EMAIL}>`,
              to: targetEmail,
              subject: `[TEST] CeriaKid simulation — ${type}`,
              html: `<p>Hi! Ini ujian simulasi pembelian (${type}). Kalau email ini sampai, bermakna Resend bekerja dengan baik.</p>`,
            }),
          });
          const data = await r.json().catch(() => ({}));
          log('resend_direct', r.ok ? 'sent' : 'failed',
            r.ok ? `emailId=${data.id}` : `status=${r.status} ${JSON.stringify(data)}`);
        }
      } catch (err) {
        log('resend_direct', 'error', err?.message || String(err));
      }
    }

    // ─── STEP 4: State Verification (read-only) ───
    try {
      if (type === 'subscription') {
        const subs = await base44.asServiceRole.entities.UserSubscription.filter({ email: targetEmail });
        const sub = subs?.[0];
        if (sub) {
          log('subscription_state', 'found', `tier=${sub.tier}, status=${sub.status}, expires=${sub.currentPeriodEnd}`);
        } else {
          log('subscription_state', 'not_found', 'No subscription record yet (OK untuk customer baru)');
        }
      } else {
        const c = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: targetEmail });
        const credit = c?.[0];
        if (credit) {
          log('credit_state', 'found', `balance=${credit.balance}, totalPurchased=${credit.totalPurchased}`);
        } else {
          log('credit_state', 'not_found', 'No credit record yet');
        }
      }
    } catch (err) {
      log('state_check', 'error', err?.message || String(err));
    }

    // ─── STEP 5: Configuration Checks ───
    const hasResendKey = !!Deno.env.get('RESEND_API_KEY');
    const hasResendFrom = !!Deno.env.get('RESEND_FROM_EMAIL');
    log('config_resend', hasResendKey && hasResendFrom ? 'ok' : 'missing',
      `key=${hasResendKey ? '✓' : '✗'}, from=${hasResendFrom ? Deno.env.get('RESEND_FROM_EMAIL') : '✗'}`);

    const hasChipBrand = !!Deno.env.get('CHIP_BRAND_ID');
    const hasChipKey = !!Deno.env.get('CHIP_SECRET_KEY');
    const hasChipWebhook = !!Deno.env.get('CHIP_WEBHOOK_SECRET');
    log('config_chip', hasChipBrand && hasChipKey && hasChipWebhook ? 'ok' : 'missing',
      `brand=${hasChipBrand ? '✓' : '✗'}, secret=${hasChipKey ? '✓' : '✗'}, webhook=${hasChipWebhook ? '✓' : '✗'}`);

    const hasVapidPub = !!Deno.env.get('VAPID_PUBLIC_KEY');
    const hasVapidPriv = !!Deno.env.get('VAPID_PRIVATE_KEY');
    log('config_vapid', hasVapidPub && hasVapidPriv ? 'ok' : 'missing',
      `public=${hasVapidPub ? '✓' : '✗'}, private=${hasVapidPriv ? '✓' : '✗'}`);

    // ─── STEP 6: Direct Web Push Test (bypass cross-invoke) ───
    if (!dryRun && hasVapidPub && hasVapidPriv) {
      try {
        let subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@ceriakid.com';
        if (!subject.startsWith('mailto:') && !subject.startsWith('http')) subject = `mailto:${subject}`;
        webpush.setVapidDetails(subject, Deno.env.get('VAPID_PUBLIC_KEY'), Deno.env.get('VAPID_PRIVATE_KEY'));

        const subs = await base44.asServiceRole.entities.PushSubscription.filter({ isAdmin: true });
        if (subs.length === 0) {
          log('webpush_direct', 'no_subscribers', 'Tiada admin yang subscribe push notification');
        } else {
          let sent = 0, failed = 0;
          await Promise.all(subs.map(async (sub) => {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify({
                  title: '🧪 Direct Push Test',
                  body: `Simulasi ${type} ${type === 'subscription' ? tier : credits + ' credits'} — ${targetEmail}`,
                  url: '/admin-dashboard',
                  tag: 'fake-order-direct',
                })
              );
              sent++;
            } catch { failed++; }
          }));
          log('webpush_direct', sent > 0 ? 'sent' : 'failed', `sent=${sent}, failed=${failed}, total=${subs.length}`);
        }
      } catch (err) {
        log('webpush_direct', 'error', err?.message || String(err));
      }
    }

    report.completedAt = new Date().toISOString();
    report.summary = {
      total: report.steps.length,
      ok: report.steps.filter(s => ['sent', 'ok', 'found'].includes(s.status)).length,
      warnings: report.steps.filter(s => ['no_subscribers', 'not_found'].includes(s.status)).length,
      failed: report.steps.filter(s => ['failed', 'error', 'missing'].includes(s.status)).length,
      skipped: report.steps.filter(s => s.status === 'skipped').length,
    };

    return Response.json({
      success: report.summary.failed === 0,
      report,
    });
  } catch (error) {
    console.error('simulateFakeOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});