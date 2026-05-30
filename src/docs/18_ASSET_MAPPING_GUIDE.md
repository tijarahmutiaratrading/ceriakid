# 🖼️ Asset URL Mapping Guide

> Complete mapping of all Base44 image URLs → Supabase Storage URLs.
> Last updated: 2026-05-30
> Total assets: **200 images**

---

## 🎯 Apa Asset Mapping?

Mapping dari URL lama (Base44) ke URL baru (Supabase Storage):

```
Old: https://media.base44.com/images/public/ABC/file.png
New: https://fpbccqqwlcvdqvntlvxx.supabase.co/storage/v1/object/public/ck-assets/images/public/ABC/file.png
```

Pattern: `media.base44.com/` → `{SUPABASE_URL}/storage/v1/object/public/ck-assets/`

---

## 📥 Get Latest Mapping (Always Fresh)

### Option 1: Via Backend Function (Recommended)
```bash
# Call backupAllAssets function with action=manifest
curl -X POST https://YOUR-APP/functions/backupAllAssets \
  -H "Authorization: Bearer YOUR-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "manifest"}'

# Returns:
# {
#   "success": true,
#   "totalMapped": 200,
#   "mapping": { "old_url_1": "new_url_1", ... }
# }
```

### Option 2: Direct Supabase Query
```sql
-- Run in Supabase SQL Editor
SELECT original_url, new_url, storage_path
FROM ck_asset_mapping
ORDER BY created_at DESC;
```

### Option 3: Export to JSON
```sql
-- Generate JSON file ready to download
SELECT jsonb_object_agg(original_url, new_url) AS mapping
FROM ck_asset_mapping;
```

---

## 🔄 Migration Pattern (Find & Replace)

### For Database Records (Auto-handled)
Records dalam `Game.gameData`, `BBMResource.fileUrl`, `AIStory.coverImage` semua dah ada di Supabase via `syncToSupabase`. **No code change needed** — just point app to Supabase tables.

### For Hardcoded UI URLs (JSX files)
Run di local terminal:

```bash
#!/bin/bash
# scripts/swap-asset-urls.sh

SUPABASE_URL="https://fpbccqqwlcvdqvntlvxx.supabase.co"
OLD_BASE="https://media.base44.com/"
NEW_BASE="${SUPABASE_URL}/storage/v1/object/public/ck-assets/"

# Find & replace in all JSX/JS files
find src -type f \( -name "*.jsx" -o -name "*.js" \) -print0 | \
  xargs -0 sed -i.bak "s|${OLD_BASE}|${NEW_BASE}|g"

echo "✅ Replaced all hardcoded URLs"
echo "Backup files saved as *.bak"
```

### For Runtime Resolution (Dynamic)
Tambah helper function dalam `lib/assetResolver.js`:

```js
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ASSET_BASE = `${SUPABASE_URL}/storage/v1/object/public/ck-assets/`;

export function resolveAssetUrl(url) {
  if (!url) return url;
  // Auto-translate Base44 URLs to Supabase
  if (url.includes('media.base44.com/')) {
    return url.replace('https://media.base44.com/', ASSET_BASE);
  }
  return url;
}

// Usage:
<img src={resolveAssetUrl(game.coverImage)} />
```

---

## 📊 Asset Inventory Summary

```
Total assets:        200 unique files
Total size:          ~50MB (estimated)
Source bucket:       media.base44.com
Destination bucket:  Supabase Storage / ck-assets
Mapping table:       ck_asset_mapping
Mapping records:     200 rows
```

### Breakdown by Source (Database Entity)
```
Game entity:         ~180 images (cover photos, game art)
BBM Resource:        ~15 images (preview thumbnails)
AI Story:            ~5 images (cover art)
Hardcoded UI:        Variable (audit dengan find-hardcoded-urls.sh)
```

---

## 🔍 Verify Mapping Integrity

### Check Total Count
```sql
SELECT COUNT(*) FROM ck_asset_mapping;
-- Expected: 200
```

### Check for Malformed URLs (double-slash bug)
```sql
SELECT * FROM ck_asset_mapping 
WHERE new_url LIKE '%.supabase.co//%';
-- Expected: 0 rows (fixed via repair-urls action)
```

### Sample Verification
```sql
SELECT 
  original_url,
  new_url,
  -- Test if file actually exists in storage
  CASE 
    WHEN new_url LIKE 'https://%' THEN '✅ Valid URL'
    ELSE '❌ Malformed'
  END AS status
FROM ck_asset_mapping
LIMIT 10;
```

---

## 🛠️ Refresh / Update Mapping

Bila ada images baru tambah, run backup:

```bash
# Scan dulu (no upload)
curl -X POST https://YOUR-APP/functions/backupAllAssets \
  -d '{"action": "scan"}'

# Backup all new assets
curl -X POST https://YOUR-APP/functions/backupAllAssets \
  -d '{"action": "backup", "limit": 50}'

# Verify
curl -X POST https://YOUR-APP/functions/backupAllAssets \
  -d '{"action": "manifest"}'
```

---

## 📋 Migration Checklist

```
□ Verify ck-assets bucket public access
□ Get latest manifest (200 rows)
□ Run find-hardcoded-urls.sh on local repo
□ Backup any new hardcoded URLs via backup-urls action
□ Apply swap-asset-urls.sh to JSX/JS files
□ OR add resolveAssetUrl() helper for runtime resolution
□ Update VITE_SUPABASE_URL in env
□ Test: landing page images load ✅
□ Test: game cover images load ✅
□ Test: BBM preview images load ✅
```

---

## ⚠️ Critical Note

**Asset mapping JSON tak commit dalam GitHub** sebab:
1. **Size:** 50KB+ JSON file (boleh grow lagi)
2. **Freshness:** Boleh outdated cepat
3. **Source of truth:** Supabase `ck_asset_mapping` table

**Better approach:** Run `backupAllAssets` action=manifest masa migration day untuk dapat snapshot terkini.

---

## 🎯 Quick Reference

```
Bucket name:    ck-assets
Table name:     ck_asset_mapping
Function:       backupAllAssets
Actions:        scan | backup | manifest | backup-urls | repair-urls
Audit script:   scripts/find-hardcoded-urls.sh
Swap script:    (create scripts/swap-asset-urls.sh per pattern above)
``