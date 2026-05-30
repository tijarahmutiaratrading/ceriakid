#!/bin/bash
# ─────────────────────────────────────────────────────
# CeriaKid Edge Functions — One-Command Deploy Script
# Phase 1 + 2 + 3 (69 functions total)
# ─────────────────────────────────────────────────────

set -e

echo "🚀 Deploying CeriaKid Edge Functions to Supabase..."
echo ""

# Functions yang require JWT (user authentication)
AUTH_FUNCTIONS=(
  # Phase 1 — Payment & AI
  "chip-checkout"
  "chip-credit-checkout"
  "ask-ai-assistant"
  "generate-ai-story"
  "generate-custom-bbm"
  "generate-quiz-question"
  "add-credits"
  "deduct-credits"
  "get-user-credits"

  # Phase 2 — Admin
  "admin-update-user"
  "admin-update-customer"
  "admin-list-affiliates"
  "admin-update-affiliate"
  "admin-process-payout"
  "bulk-update-user-names"
  "get-customer-details"
  "get-admin-secrets"
  "get-supabase-sync-status"
  "get-game-analytics"

  # Phase 2 — Push
  "subscribe-to-push"
  "unsubscribe-from-push"

  # Phase 2 — Affiliate (user)
  "register-affiliate"
  "get-affiliate-data"
  "update-affiliate-bank"
  "request-affiliate-payout"

  # Phase 3 — Misc user
  "save-quiz-answer"
  "send-parent-notification"

  # Phase 3 — Admin generators/QC (stubs)
  "launch-generate-batch"
  "launch-generate-story-kid"
  "launch-purge-bucket"
  "launch-get-progress"
  "launch-get-story-progress"
  "launch-get-mini-games-progress"
  "generate-all-kafa"
  "background-launch-generator"
  "background-story-generator"
  "regenerate-story-kid-images"
  "audit-all-games"
  "audit-story-kid-games"
  "audit-quiz-answers"
  "repair-all-games"
  "restore-quiz-answers-from-description"
  "get-qc-overview-report"
  "update-quality-control-settings"
  "normalize-kssr-buckets"
  "delete-mini-games"
  "delete-story-kid-games"
  "get-game-manager-counts"
  "get-worker-activity"
  "get-background-activity-status"
  "generate-vapid-keys"
)

# Public functions (no JWT — webhooks, server-to-server, scheduled, public stats)
PUBLIC_FUNCTIONS=(
  # Phase 1
  "chip-webhook"
  "send-welcome-email"

  # Phase 2 — Scheduled email reminders
  "send-abandoned-cart-reminders"
  "send-expiry-reminders"
  "send-low-credit-reminders"
  "send-streak-reminders"
  "send-weekly-progress-report"

  # Phase 2 — Server-to-server push
  "send-push-notification"

  # Phase 2 — Scheduled cleanup & health
  "cleanup-stuck-subscriptions"
  "run-health-check"

  # Phase 2 — Public marketing
  "get-public-game-stats"

  # Phase 3 — Server-to-server
  "fb-conversions-api"
  "send-resend-email"

  # Phase 3 — Scheduled no-ops (compat)
  "sync-to-supabase"
  "backup-all-assets"
  "sync-migration-kit"
)

# Deploy auth functions
echo "📦 Deploying authenticated functions (${#AUTH_FUNCTIONS[@]})..."
for fn in "${AUTH_FUNCTIONS[@]}"; do
  echo "  → $fn"
  supabase functions deploy "$fn"
done

echo ""
echo "🌐 Deploying public functions (${#PUBLIC_FUNCTIONS[@]})..."
for fn in "${PUBLIC_FUNCTIONS[@]}"; do
  echo "  → $fn (no JWT verification)"
  supabase functions deploy "$fn" --no-verify-jwt
done

TOTAL=$((${#AUTH_FUNCTIONS[@]} + ${#PUBLIC_FUNCTIONS[@]}))
echo ""
echo "✅ All $TOTAL functions deployed!"
echo ""
echo "Next steps:"
echo "1. Set secrets: supabase secrets set --env-file .env"
echo "2. Update CHIP webhook URL: https://YOUR_PROJECT.supabase.co/functions/v1/chip-webhook"
echo "3. Setup scheduled automations via pg_cron (see DEPLOYMENT.md)"
echo "4. Stubs (game generators/QC) need manual translation if needed — see _STUBS_README.md"