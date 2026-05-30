#!/bin/bash
# find-hardcoded-urls.sh
# Scan src/ folder untuk hardcoded media.base44.com URLs dalam JSX/JS files
# Output: list URL unik untuk di-backup via backupAllAssets backend function
#
# Usage:
#   chmod +x scripts/find-hardcoded-urls.sh
#   ./scripts/find-hardcoded-urls.sh
#
# Output saved to: scripts/hardcoded-urls.json
# Then call: base44.functions.invoke('backupAllAssets', { action: 'backup-urls', urls: [...] })

set -e

OUTPUT_FILE="scripts/hardcoded-urls.json"

echo "🔍 Scanning src/ for hardcoded media.base44.com URLs..."

# Find unique URLs in JSX/JS files
URLS=$(grep -rhoE 'https://media\.base44\.com/[^"'"'"' )]+' src/ 2>/dev/null | sort -u || true)

if [ -z "$URLS" ]; then
  echo "✅ No hardcoded Base44 URLs found in src/"
  echo "[]" > "$OUTPUT_FILE"
  exit 0
fi

COUNT=$(echo "$URLS" | wc -l | tr -d ' ')

# Convert to JSON array
echo "$URLS" | awk 'BEGIN{print "["} {if(NR>1)print ","; printf "  \"%s\"", $0} END{print "\n]"}' > "$OUTPUT_FILE"

echo "✅ Found $COUNT unique hardcoded URLs"
echo "📄 Saved to: $OUTPUT_FILE"
echo ""
echo "Next step:"
echo "  Read the file and pass urls to backupAllAssets function:"
echo "  base44.functions.invoke('backupAllAssets', { action: 'backup-urls', urls: [...] })"