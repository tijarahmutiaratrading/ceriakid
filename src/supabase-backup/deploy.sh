#!/bin/bash
# ─────────────────────────────────────────────────────
# CeriaKid Edge Functions — One-Command Deploy Script
# Phase 1 + Phase 2 (37 functions)
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

echo ""
echo "✅ All ${#AUTH_FUNCTIONS[@]} + ${#PUBLIC_FUNCTIONS[@]} functions deployed!"
echo ""
echo "Next steps:"
echo "1. Set secrets: supabase secrets set --env-file .env"
echo "2. Update CHIP webhook URL: https://YOUR_PROJECT.supabase.co/functions/v1/chip-webhook"
echo "3. Setup scheduled automations via pg_cron (see DEPLOYMENT.md)"
echo "4. Test: curl https://YOUR_PROJECT.supabase.co/functions/v1/get-user-credits"