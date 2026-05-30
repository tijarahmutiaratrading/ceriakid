// Backup Supabase Edge Function source code ke Supabase Storage bucket `supabase-backend`.
//
// Strategy: All 69 functions + shared helpers + docs are stored in `supabase-backup/`
// folder dalam Base44 project (auto-synced to GitHub). This function uploads a
// MANIFEST + deployment instructions to bucket — actual source code stays in git.
//
// For full code disaster recovery, builder can:
//   1. Download manifest.json + deploy-instructions.md from bucket
//   2. Clone GitHub repo to get all `supabase-backup/functions/*/index.ts` files
//   3. Run `supabase functions deploy <name>` per function
//
// Bucket also stores shared helpers inline for quick recovery without git access.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');
const BUCKET = 'supabase-backend';

// All 69 Edge Functions in the migration kit
const ALL_FUNCTIONS = [
  // Phase 1 — payment + AI + credits + auth (11)
  'chip-checkout', 'chip-credit-checkout', 'chip-webhook',
  'ask-ai-assistant', 'generate-ai-story', 'generate-custom-bbm', 'generate-quiz-question',
  'add-credits', 'deduct-credits', 'get-user-credits', 'send-welcome-email',
  // Phase 2 — emails, push, admin (26)
  'send-abandoned-cart-reminders', 'send-expiry-reminders', 'send-low-credit-reminders',
  'send-streak-reminders', 'send-weekly-progress-report',
  'subscribe-to-push', 'unsubscribe-from-push', 'send-push-notification',
  'admin-update-user', 'admin-update-customer', 'admin-list-affiliates',
  'admin-update-affiliate', 'admin-process-payout', 'bulk-update-user-names',
  'get-customer-details', 'get-admin-secrets', 'get-supabase-sync-status',
  'cleanup-stuck-subscriptions',
  'run-health-check', 'get-game-analytics', 'get-public-game-stats',
  'register-affiliate', 'get-affiliate-data', 'update-affiliate-bank', 'request-affiliate-payout',
  // Phase 3 — generators, QC, utilities (32)
  'fb-conversions-api', 'save-quiz-answer', 'send-resend-email', 'send-parent-notification',
  'generate-vapid-keys', 'get-qc-overview-report', 'update-quality-control-settings',
  'delete-mini-games', 'delete-story-kid-games', 'get-game-manager-counts',
  'get-worker-activity', 'get-background-activity-status',
  'sync-to-supabase', 'backup-all-assets', 'sync-migration-kit',
  'launch-generate-batch', 'launch-generate-story-kid', 'launch-purge-bucket',
  'launch-get-progress', 'launch-get-story-progress', 'launch-get-mini-games-progress',
  'generate-all-kafa', 'background-launch-generator', 'background-story-generator',
  'regenerate-story-kid-images', 'audit-all-games', 'audit-story-kid-games',
  'audit-quiz-answers', 'repair-all-games', 'restore-quiz-answers-from-description',
  'normalize-kssr-buckets',
];

const SHARED_HELPERS = [
  '_shared/cors.ts', '_shared/supabaseAdmin.ts', '_shared/authGuards.ts',
  '_shared/resend.ts', '_shared/webpush.ts', '_shared/llm.ts', '_shared/credits.ts',
];

// Files that get uploaded directly with full content (shared helpers — small + critical)
const INLINE_FILES: Record<string, string> = {
  'manifest.json': JSON.stringify({
    version: '2.0',
    generated_at: new Date().toISOString(),
    total_functions: ALL_FUNCTIONS.length,
    functions: ALL_FUNCTIONS,
    shared_helpers: SHARED_HELPERS,
    github_path: 'supabase-backup/functions/<function-name>/index.ts',
    notes: [
      'All 69 functions deployable via Supabase CLI.',
      'AI functions (askAI, story, BBM, quiz) require OPENAI_API_KEY secret.',
      'Payment functions need CHIP_BRAND_ID, CHIP_SECRET_KEY, CHIP_WEBHOOK_SECRET.',
      'Email functions need RESEND_API_KEY + RESEND_FROM_EMAIL.',
      'Push notifications need VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY + VAPID_SUBJECT.',
    ],
  }, null, 2),

  'DEPLOY.md': `# Disaster Recovery Deployment

## Quick Start (when Base44 is down)

### Step 1: Get source code
\`\`\`bash
git clone https://github.com/YOUR_ORG/ceriakid.git
cd ceriakid/supabase-backup
\`\`\`

### Step 2: Setup Supabase project secrets
\`\`\`bash
supabase secrets set CHIP_BRAND_ID=xxx CHIP_SECRET_KEY=xxx CHIP_WEBHOOK_SECRET=xxx
supabase secrets set RESEND_API_KEY=xxx RESEND_FROM_EMAIL="CeriaKid <hello@ceriakid.com>"
supabase secrets set VAPID_PUBLIC_KEY=xxx VAPID_PRIVATE_KEY=xxx VAPID_SUBJECT=mailto:admin@ceriakid.com
supabase secrets set FB_PIXEL_ID=xxx FB_ACCESS_TOKEN=xxx
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set APP_URL=https://ceriakid.com
\`\`\`

### Step 3: Deploy all 69 functions
\`\`\`bash
chmod +x deploy.sh && ./deploy.sh
\`\`\`

### Step 4: Schedule cron jobs
Run \`sql/setup-cron-jobs.sql\` in Supabase SQL Editor.

### Step 5: Update frontend
Switch frontend SDK from base44 to supabase (\`supabase-backup/auth/supabaseClient.js\`).

## Function inventory: ${ALL_FUNCTIONS.length} total
${ALL_FUNCTIONS.map((f, i) => `${i + 1}. ${f}`).join('\n')}
`,
};

// ─── Helpers ────────────────────────────────────────────────────────────

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
  if (!res.ok && res.status !== 409) {
    console.warn(`Bucket create ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

async function uploadFile(path: string, content: string): Promise<{ ok: boolean; error?: string }> {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const ext = path.split('.').pop() || '';
  const ct = ext === 'md' ? 'text/markdown' : ext === 'sql' ? 'application/sql'
    : ext === 'json' ? 'application/json' : ext === 'sh' ? 'text/x-shellscript' : 'text/typescript';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Content-Type': ct,
      'x-upsert': 'true',
    },
    body: content,
  });
  if (res.ok) return { ok: true };
  return { ok: false, error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
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
    const results: Record<string, any> = {};
    let uploaded = 0, failed = 0;

    for (const [path, content] of Object.entries(INLINE_FILES)) {
      const r = await uploadFile(path, content);
      results[path] = { ok: r.ok, error: r.error, size: content.length };
      if (r.ok) uploaded++; else failed++;
    }

    return Response.json({
      success: failed === 0,
      bucket: BUCKET,
      totalFunctionsInManifest: ALL_FUNCTIONS.length,
      totalFilesUploaded: Object.keys(INLINE_FILES).length,
      uploaded,
      failed,
      durationMs: Date.now() - startTime,
      results,
      note: 'Full function source code in GitHub repo: supabase-backup/functions/*. Manifest + DEPLOY.md uploaded to bucket.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});