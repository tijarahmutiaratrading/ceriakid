# 📦 Storage — Already Auto-Backed Up ✅

> Status: **Storage migration COMPLETE.** Tiada apa-apa yang perlu dibuat.

---

## ✅ Current Status

Semua assets (images, files) yang asal di `media.base44.com` **dah pun di-backup** ke Supabase Storage secara **automatic**.

### How it works:
1. **`backupAllAssets` function** jalan setiap **3 jam** (scheduled automation)
2. Scan semua entities untuk URL `media.base44.com/*`
3. Download asset → upload ke Supabase Storage bucket `ck-assets`
4. Simpan URL mapping di table `ck_asset_mapping`

### Tables/buckets terlibat:
- **Supabase Storage:** Bucket `ck-assets` (public-read)
- **Database:** `ck_asset_mapping` table
  - `original_url` (TEXT) — URL Base44 asal
  - `supabase_url` (TEXT) — URL Supabase Storage baru
  - `bucket_path` (TEXT) — File path dalam bucket
  - `mime_type`, `size_bytes`, `entity_name`, `field_path`

---

## 🔄 Bila Base44 Down — How to Use Migrated Assets

### Option 1: Use mapping table to swap URLs
```sql
-- Query mapping untuk dapatkan URL Supabase
SELECT supabase_url FROM ck_asset_mapping 
WHERE original_url = 'https://media.base44.com/abc/xyz.png';
```

### Option 2: Update entities to use new URLs (one-time migration)
```sql
-- Example: update Game entity cover images
UPDATE ck_games
SET emoji_image = (
  SELECT supabase_url FROM ck_asset_mapping 
  WHERE original_url = ck_games.emoji_image
)
WHERE emoji_image LIKE 'https://media.base44.com/%';
```

### Option 3: Frontend redirect logic
```jsx
function resolveAssetUrl(url) {
  if (!url?.includes('media.base44.com')) return url;
  
  // Check mapping cache
  const mapped = assetMappingCache.get(url);
  return mapped || url; // fallback ke original kalau tak jumpa
}
```

---

## 📁 Storage Bucket Structure

```
ck-assets/
├── games/
│   ├── covers/
│   └── images/
├── stories/
│   └── covers/          # AI-generated story images
├── bbm/
│   └── previews/
├── users/
│   ├── avatars/         # User profile pictures
│   └── children/        # Child profile avatars
├── drawings/            # User-created drawings
└── misc/                # Other uploads
```

---

## 🛠️ Setup New Bucket (kalau project baru)

Kalau migrate ke Supabase project baru, kena create bucket dulu:

```sql
-- Run di Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('ck-assets', 'ck-assets', true);

-- Policy: public read access
CREATE POLICY "Public read ck-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'ck-assets');

-- Policy: authenticated users can upload
CREATE POLICY "Authenticated upload ck-assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ck-assets' AND auth.role() = 'authenticated'
  );
```

---

## 📊 Backup Schedule

| Task | Frequency | Function |
|---|---|---|
| Asset Backup | Every 3 hours | `backupAllAssets` |
| Data Sync | Every 3 hours | `syncToSupabase` |
| Health Check | Every 1 hour | `runHealthCheck` |

Lihat `docs/12_ASSETS_BACKUP.md` untuk full backup strategy.

---

> 🎯 **TL;DR:** Storage **dah handled** — tiada manual migration diperlukan. Mapping table sudah maintain link antara URL lama dan baru.