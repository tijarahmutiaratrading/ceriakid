# 12. Assets Backup & Migration Guide

> **CRITICAL untuk 100% clone**: Code di GitHub tak cukup — semua gambar di-host di `media.base44.com`. File ni explain macam mana backup semua images ke Supabase Storage.

---

## 🚨 Problem Statement

CeriaKid frontend code (di GitHub) reference images dari Base44 CDN:

```jsx
<img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_logo.png" />
```

Kalau Base44 down atau anda migrate fully:
- ❌ Semua logo, avatar, mascot, subject images hilang
- ❌ AI-generated story covers hilang
- ❌ BBM preview images hilang
- ❌ User avatars (uploaded) hilang

**Solution:** Backup semua images ke Supabase Storage SEKARANG (sementara Base44 masih live).

---

## 🛠️ Backup Tool: `backupAllAssets`

Backend function yang automatic:
1. Scan semua entities (Game, BBMResource, AIStory, User, etc.)
2. Extract semua `media.base44.com` URLs
3. Download images
4. Upload ke Supabase Storage bucket `ck-assets`
5. Save URL mapping ke table `ck_asset_mapping`

---

## 📋 Setup (One-Time)

### Step 1: Create Supabase Storage Bucket

Login Supabase Dashboard → Storage → Create new bucket:

```
Name: ck-assets
Public: ✅ YES (allow public read)
File size limit: 50 MB
Allowed MIME types: image/*, application/pdf
```

### Step 2: Create Mapping Table

Run SQL in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS ck_asset_mapping (
  id BIGSERIAL PRIMARY KEY,
  old_url TEXT UNIQUE NOT NULL,
  new_url TEXT NOT NULL,
  backed_up_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ck_asset_mapping_old_url ON ck_asset_mapping(old_url);
```

### Step 3: Verify Secrets

Pastikan ada dalam Base44 secrets:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_KEY`

(Anda dah ada — confirmed dari existing_secrets list)

---

## 🚀 Running the Backup

### Step 1: Scan (Preview Only)

```javascript
// Frontend or admin panel
const res = await base44.functions.invoke('backupAllAssets', {
  action: 'scan'
});

console.log(res.data);
// {
//   totalUrls: 247,
//   summary: {
//     Game: 50,
//     BBMResource: 32,
//     AIStory: 145,
//     User: 20
//   },
//   sampleUrls: [...]
// }
```

### Step 2: Full Backup

```javascript
const res = await base44.functions.invoke('backupAllAssets', {
  action: 'backup',
  limit: 200  // process 200 images per call (safety cap)
});

console.log(res.data);
// {
//   newlyBackedUp: 200,
//   alreadyBackedUp: 0,
//   remaining: 47,
//   errors: []
// }
```

**Run multiple times** sampai `remaining: 0`.

### Step 3: Verify Manifest

```javascript
const res = await base44.functions.invoke('backupAllAssets', {
  action: 'manifest'
});

console.log(res.data);
// {
//   totalMapped: 247,
//   mapping: {
//     "https://media.base44.com/images/public/ABC/file.png":
//     "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/ck-assets/images/public/ABC/file.png"
//   }
// }
```

---

## 🔄 Migration: Replace URLs in Code

Once backup complete, anda kena replace semua URLs dalam code. Pilih satu approach:

### Approach A: Runtime Rewriter (Fastest, no code changes)

Tambah dalam `index.html` atau `main.jsx`:

```javascript
// Auto-rewrite Base44 URLs to Supabase Storage at runtime
const urlMapping = await fetch('/url-mapping.json').then(r => r.json());

// Intercept all <img> src changes
const observer = new MutationObserver(() => {
  document.querySelectorAll('img[src*="media.base44.com"]').forEach(img => {
    if (urlMapping[img.src]) {
      img.src = urlMapping[img.src];
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true, attributes: true });
```

Save `manifest.json` from `action: 'manifest'` call to `public/url-mapping.json`.

### Approach B: Build-Time Replace (Cleanest)

Run script ni sebelum build:

```bash
node scripts/replace-urls.js
```

```javascript
// scripts/replace-urls.js
import fs from 'fs';
import path from 'path';

const mapping = JSON.parse(fs.readFileSync('./url-mapping.json'));
const SRC_DIR = './src';

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      Object.entries(mapping).forEach(([oldUrl, newUrl]) => {
        if (content.includes(oldUrl)) {
          content = content.replaceAll(oldUrl, newUrl);
          changed = true;
        }
      });
      if (changed) {
        fs.writeFileSync(full, content);
        console.log(`✅ Updated: ${full}`);
      }
    }
  });
}

walkDir(SRC_DIR);
console.log('Done!');
```

### Approach C: Helper Function (Hybrid)

Buat lib helper untuk wrap semua `<img>`:

```javascript
// lib/assetUrl.js
import mapping from './asset-mapping.json';

export function assetUrl(url) {
  return mapping[url] || url; // fallback to original if not mapped
}

// Usage:
<img src={assetUrl("https://media.base44.com/...")} />
```

---

## 📊 What Gets Backed Up

### Automatic (from entities):

| Entity | Image Fields | Estimate |
|---|---|---|
| `Game` | `gameData.questions[].image`, `gameData.coverImage` | ~50 |
| `BBMResource` | `fileUrl`, `previewImageUrl` | ~30 |
| `AIStory` | `coverImage` (1 per story) | ~100-500 |
| `User` | `avatarUrl` | ~20 per active user |

### Manual (hardcoded in code):

These are hardcoded in JSX files — backup automatic kalau referenced di DB, tapi yang hardcoded perlu manual scan:

- Logo CeriaKid: `c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png`
- Testimonial avatars: `512f26c46_generated_image.png`, etc.
- Subject illustrations: `866fc318d_*.png`, etc.
- Mascot illustrations

**Cara backup yang hardcoded:**

Run grep scan locally:
```bash
grep -r "media.base44.com" src/ > hardcoded-urls.txt
```

Then download manually atau extend backup function untuk include constant URLs.

---

## 🎯 Rebuild Recipe (Untuk AI Builder)

Bila AI builder receive ni untuk clone CeriaKid:

```markdown
INSTRUCTION TO AI BUILDER:
========================

1. Clone GitHub repo: github.com/USER/ceriakid
2. Setup Supabase project (lihat docs/06_SUPABASE_MIGRATION.md)
3. Run SQL schema: docs/09_COMPLETE_SQL_SCHEMA.md
4. Download asset manifest:
   - Fetch from: https://YOUR-PROJECT.supabase.co/storage/v1/object/public/ck-assets/manifest.json
   - OR copy from docs/url-mapping.json (committed)
5. Run replace-urls script: `node scripts/replace-urls.js`
6. Set env vars (lihat docs/08_SECRETS_AND_ENV.md)
7. Install: `npm install`
8. Deploy: `npm run build && vercel deploy`

EXPECTED RESULT: 100% visual clone of CeriaKid running on Supabase.
TIME: 1-3 hours with modern AI builders.
```

---

## ⚠️ Important Notes

### CORS Configuration

Supabase Storage public buckets serve images with proper CORS. Tapi kalau anda nak custom domain:

```sql
-- Set bucket CORS in Supabase
UPDATE storage.buckets 
SET public = true,
    cors_origins = ARRAY['*']
WHERE id = 'ck-assets';
```

### Storage Pricing

Supabase free tier:
- ✅ 1 GB storage included
- ✅ 2 GB bandwidth/month

Estimate untuk CeriaKid:
- ~500 images × ~200 KB avg = ~100 MB total
- **Well within free tier** ✅

### Image Optimization (Optional)

Untuk faster load, consider running images through:
- TinyPNG / Squoosh sebelum re-upload
- Convert PNG → WebP (50% smaller)
- Use Supabase Image Transformations (Pro plan)

### Refresh Schedule

Setiap kali ada content baru (AI story, BBM, etc.), run backup lagi:

```javascript
// Schedule: Daily 3 AM
await base44.functions.invoke('backupAllAssets', { action: 'backup' });
```

Atau buat scheduled automation untuk auto-backup setiap hari.

---

## 🔍 Troubleshooting

### "Fetch failed: 403"
Base44 image temporary down. Retry later.

### "Upload failed: 401"
SUPABASE_SERVICE_KEY tak betul. Check secrets.

### "Bucket not found"
Run Step 1 (create bucket) dulu.

### Mapping table tak update
Check Supabase Row Level Security (RLS) — kena allow service role.

```sql
-- Disable RLS on mapping table (it's internal admin data)
ALTER TABLE ck_asset_mapping DISABLE ROW LEVEL SECURITY;
```

---

## ✅ Checklist Before Migration

- [ ] Bucket `ck-assets` created in Supabase
- [ ] Table `ck_asset_mapping` created
- [ ] Run `action: 'scan'` — note total URL count
- [ ] Run `action: 'backup'` repeatedly until `remaining: 0`
- [ ] Run `action: 'manifest'` — export JSON
- [ ] Save manifest to `docs/url-mapping.json` (commit to GitHub)
- [ ] Test 1-2 images: open Supabase URL in browser
- [ ] Document hardcoded URLs (grep scan)
- [ ] Add to recovery playbook (docs/07)

---

## 🎯 Result: 100% Migration Ready

After completion:
- ✅ All code in GitHub
- ✅ All schema documented
- ✅ All images backed up to Supabase Storage
- ✅ URL mapping JSON available
- ✅ Replace script ready

**AI builder can rebuild CeriaKid in 1-3 hours with full visual fidelity.** 🚀