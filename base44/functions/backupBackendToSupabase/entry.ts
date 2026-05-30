// Backup shared backend infrastructure (helpers + SQL setup) ke Supabase Storage
// bucket `supabase-backend`. Tak deploy edge functions — cuma upload code mentah
// supaya bila Base44 down, tinggal pull dari bucket + deploy manual via Supabase CLI.
//
// Files uploaded:
//   _shared/cors.ts
//   _shared/supabaseAdmin.ts
//   _shared/resend.ts
//   _shared/webpush.ts
//   _shared/authGuards.ts
//   _shared/stub.ts
//   sql/setup-cron-jobs.sql
//   AUTOMATIONS_SETUP.md
//   README.md
//
// Run: base44.functions.invoke('backupBackendToSupabase', {})
// Scheduled (3h): auto from automation.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');
const BUCKET = 'supabase-backend';

// ─── Embedded file contents ──────────────────────────────────────────────

const FILES: Record<string, string> = {
  '_shared/cors.ts': `// CORS helper untuk Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
`,

  '_shared/supabaseAdmin.ts': `// Supabase admin client + auth helper
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY')!;

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Get authenticated user dari request (validate JWT)
export async function getUserFromRequest(req: Request): Promise<any | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  // Fetch role from ck_users table
  const { data: userRow } = await supabaseAdmin
    .from('ck_users')
    .select('id, email, role, full_name')
    .eq('id', data.user.id)
    .maybeSingle();

  return userRow || { id: data.user.id, email: data.user.email, role: 'user' };
}
`,

  '_shared/resend.ts': `// Shared Resend email helper
// Used by all email sending functions

export async function sendEmail({
  to, subject, html, fromName = 'CeriaKid',
}: { to: string; subject: string; html: string; fromName?: string }): Promise<{ ok: boolean; id?: string; error?: string }> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');

  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    return { ok: false, error: 'Resend not configured' };
  }

  const fromAddress = RESEND_FROM_EMAIL.includes('<')
    ? RESEND_FROM_EMAIL
    : \`\${fromName} <\${RESEND_FROM_EMAIL}>\`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${RESEND_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromAddress, to, subject, html }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.id) return { ok: true, id: data.id };
    return { ok: false, error: data?.message || \`HTTP \${res.status}\` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
`,

  '_shared/webpush.ts': `// Shared Web Push helper
// Send notifications via VAPID + cleanup dead endpoints
import webpush from 'npm:web-push@3.6.7';
import { supabaseAdmin } from './supabaseAdmin.ts';

function sanitizeSubject(raw: string): string {
  let subject = raw.trim().replace(/[<>]/g, '').replace(/\\s+/g, '');
  if (!subject.startsWith('mailto:') && !subject.startsWith('http')) {
    subject = \`mailto:\${subject}\`;
  }
  return subject.replace(/^mailto:\\s+/, 'mailto:');
}

export function setupVapid() {
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const subjectRaw = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@ceriakid.com';
  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not configured');
  }
  webpush.setVapidDetails(sanitizeSubject(subjectRaw), publicKey, privateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

export async function sendToSubscribers(
  subscribers: any[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; cleaned: number }> {
  const notif = JSON.stringify(payload);
  let sent = 0, failed = 0;
  const deadEndpoints: string[] = [];

  await Promise.all(subscribers.map(async (sub: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        notif
      );
      sent++;
    } catch (err: any) {
      failed++;
      if (err.statusCode === 410 || err.statusCode === 404) {
        deadEndpoints.push(sub.id);
      }
    }
  }));

  for (const id of deadEndpoints) {
    await supabaseAdmin.from('ck_push_subscriptions').delete().eq('id', id);
  }

  return { sent, failed, cleaned: deadEndpoints.length };
}
`,

  '_shared/authGuards.ts': `// Shared auth guards untuk admin / scheduled / public endpoints
import { getUserFromRequest } from './supabaseAdmin.ts';
import { jsonResponse } from './cors.ts';

export async function requireAdmin(req: Request): Promise<Response | { user: any }> {
  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);
  if (user.role !== 'admin') return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
  return { user };
}

export async function requireUser(req: Request): Promise<Response | { user: any }> {
  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);
  return { user };
}

export async function requireAdminOrScheduled(req: Request): Promise<Response | { user: any | null; isScheduled: boolean }> {
  let isScheduled = false;
  try {
    const body = await req.clone().json();
    if (body?.scheduled === true || body?.automation?.type === 'scheduled') {
      isScheduled = true;
    }
  } catch { /* no body */ }

  if (isScheduled) return { user: null, isScheduled: true };

  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);
  if (user.role !== 'admin') return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
  return { user, isScheduled: false };
}
`,

  '_shared/stub.ts': `// Shared stub helper untuk admin generator/QC functions
// Return helpful message tanpa execute complex logic
import { handleCors, jsonResponse } from './cors.ts';
import { requireAdmin } from './authGuards.ts';

export async function adminStub(req: Request, functionName: string): Promise<Response> {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  return jsonResponse({
    success: false,
    status: 'not_implemented',
    function: functionName,
    message: \`\${functionName} is a stub in the Supabase backup. Game content generation and QC logic requires full translation from Base44 InvokeLLM prompts.\`,
    fallback: 'Use Base44 dashboard while operational, or implement manually using OpenAI API.',
  });
}
`,

  'sql/setup-cron-jobs.sql': `-- ════════════════════════════════════════════════════════════
-- CeriaKid — pg_cron Setup (one-shot)
-- ⚠️ DO NOT RUN sehingga ready cutover dari Base44 ke Supabase.
-- ════════════════════════════════════════════════════════════

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Store secrets dalam Vault (GANTI value sebenar)
-- SELECT vault.create_secret('https://YOUR_PROJECT.supabase.co', 'project_url');
-- SELECT vault.create_secret('YOUR_SERVICE_ROLE_KEY', 'service_role_key');

-- 3. Helper function untuk panggil edge function
CREATE OR REPLACE FUNCTION call_edge_function(fn_name text, body jsonb DEFAULT '{}'::jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  request_id bigint;
  project_url text;
  service_key text;
BEGIN
  SELECT decrypted_secret INTO project_url FROM vault.decrypted_secrets WHERE name = 'project_url';
  SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'service_role_key';
  SELECT net.http_post(
    url := project_url || '/functions/v1/' || fn_name,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || service_key),
    body := body
  ) INTO request_id;
  RETURN request_id;
END;
$$;

-- 4. Schedule jobs
SELECT cron.schedule('supabase-sync-3h', '0 */3 * * *', $$ SELECT call_edge_function('sync-to-supabase', '{"scheduled": true}'::jsonb); $$);
SELECT cron.schedule('asset-backup-3h', '30 */3 * * *', $$ SELECT call_edge_function('backup-all-assets', '{"scheduled": true, "limit": 100}'::jsonb); $$);
SELECT cron.schedule('abandoned-cart-hourly', '0 * * * *', $$ SELECT call_edge_function('send-abandoned-cart-reminders'); $$);
SELECT cron.schedule('low-credit-daily', '0 2 * * *', $$ SELECT call_edge_function('send-low-credit-reminders', '{"scheduled": true}'::jsonb); $$);
SELECT cron.schedule('streak-reminder-daily', '0 10 * * *', $$ SELECT call_edge_function('send-streak-reminders'); $$);
SELECT cron.schedule('weekly-report-sunday', '0 1 * * 0', $$ SELECT call_edge_function('send-weekly-progress-report'); $$);
SELECT cron.schedule('expiry-reminders-daily', '0 0 * * *', $$ SELECT call_edge_function('send-expiry-reminders'); $$);
SELECT cron.schedule('cleanup-stuck-subs-6h', '0 */6 * * *', $$ SELECT call_edge_function('cleanup-stuck-subscriptions'); $$);
SELECT cron.schedule('health-check-6h', '15 */6 * * *', $$ SELECT call_edge_function('run-health-check'); $$);

-- 5. Verify
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
`,

  'README.md': `# CeriaKid Supabase Backend Backup

Files in this bucket are uploaded automatically setiap 3 jam dari Base44 backend
function \`backupBackendToSupabase\`. Purpose: disaster recovery — bila Base44 down,
tinggal download semua file + deploy via Supabase CLI.

## Structure
- \`_shared/\` — Shared TypeScript helpers (cors, auth, resend, webpush, supabaseAdmin)
- \`sql/setup-cron-jobs.sql\` — pg_cron schedule SQL (DO NOT RUN until cutover)
- Full edge function code lives di GitHub repo (folder \`supabase-backup/functions/\`)

## Activation (bila ready cutover)
1. Download semua file dari bucket
2. \`cd\` ke project, \`supabase functions deploy <name>\` untuk setiap function
3. Run \`sql/setup-cron-jobs.sql\` dalam Supabase SQL Editor
4. Update frontend SDK untuk point ke Supabase Auth

Last updated: auto (every 3 hours)
`,
};

// ─── Upload helper ───────────────────────────────────────────────────────

async function uploadFile(path: string, content: string): Promise<{ ok: boolean; error?: string }> {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Content-Type': path.endsWith('.md') ? 'text/markdown' : path.endsWith('.sql') ? 'application/sql' : 'text/typescript',
      'x-upsert': 'true',
    },
    body: content,
  });
  if (res.ok) return { ok: true };
  const errText = await res.text();
  return { ok: false, error: `${res.status}: ${errText.slice(0, 200)}` };
}

async function ensureBucket(): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
  });
  // 200/409 = ok (exists), other = log
  if (!res.ok && res.status !== 409) {
    const txt = await res.text();
    console.warn(`Bucket create returned ${res.status}: ${txt.slice(0, 200)}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const isScheduled = body.scheduled === true || body?.automation?.type === 'scheduled';

    if (!isScheduled) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
      }
    }

    await ensureBucket();

    const startTime = Date.now();
    const results: Record<string, { ok: boolean; error?: string; size?: number }> = {};
    let uploaded = 0;
    let failed = 0;

    for (const [path, content] of Object.entries(FILES)) {
      const r = await uploadFile(path, content);
      results[path] = { ok: r.ok, error: r.error, size: content.length };
      if (r.ok) uploaded++;
      else failed++;
    }

    return Response.json({
      success: failed === 0,
      bucket: BUCKET,
      totalFiles: Object.keys(FILES).length,
      uploaded,
      failed,
      durationMs: Date.now() - startTime,
      results,
    });
  } catch (error) {
    console.error('backupBackendToSupabase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});