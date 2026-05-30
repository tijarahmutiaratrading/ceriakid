/**
 * backupAllAssets — Asset Backup & Migration Tool
 *
 * Purpose:
 * Scan semua entities untuk media.base44.com URLs, download images,
 * upload ke Supabase Storage, dan generate URL mapping JSON.
 *
 * Output:
 * 1. Semua images backup ke Supabase Storage bucket "ck-assets"
 * 2. URL mapping disimpan dalam Supabase table "ck_asset_mapping"
 * 3. Return JSON manifest yang boleh dipakai untuk find/replace
 *
 * Usage: Admin only.
 * - POST { action: "scan" } → list semua URLs (no download)
 * - POST { action: "backup" } → download + upload (full backup)
 * - POST { action: "manifest" } → get current URL mapping
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');
const BUCKET_NAME = 'ck-assets';

// Entities yang ada image fields
const IMAGE_ENTITIES = [
  { entity: 'Game', fields: ['gameData'] }, // nested in gameData
  { entity: 'BBMResource', fields: ['fileUrl', 'previewImageUrl'] },
  { entity: 'AIStory', fields: ['coverImage'] },
  { entity: 'UserSubscription', fields: [] }, // avatar in User entity
];

// URL pattern untuk detect Base44 media
const BASE44_URL_REGEX = /https:\/\/media\.base44\.com\/[^\s"')]+/g;

// Recursive scanner — cari semua base44 URLs dalam object
function extractUrls(obj, urls = new Set()) {
  if (!obj) return urls;
  if (typeof obj === 'string') {
    const matches = obj.match(BASE44_URL_REGEX);
    if (matches) matches.forEach(u => urls.add(u));
    return urls;
  }
  if (Array.isArray(obj)) {
    obj.forEach(item => extractUrls(item, urls));
    return urls;
  }
  if (typeof obj === 'object') {
    Object.values(obj).forEach(v => extractUrls(v, urls));
  }
  return urls;
}

// Sanitize URL → file path dalam bucket
function urlToPath(url) {
  // https://media.base44.com/images/public/ABC/file.png → images/public/ABC/file.png
  return url.replace('https://media.base44.com/', '');
}

// Upload to Supabase Storage
async function uploadToSupabase(path, blob, contentType) {
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${path}`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: blob,
  });
  if (!res.ok && res.status !== 409) {
    const errText = await res.text();
    throw new Error(`Upload failed (${res.status}): ${errText}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}

// Save mapping to Supabase table
async function saveMapping(mapping) {
  const records = Object.entries(mapping).map(([originalUrl, newUrl]) => ({
    original_url: originalUrl,
    new_url: newUrl,
    storage_path: originalUrl.replace('https://media.base44.com/', ''),
  }));

  // Chunk inserts (500 per batch)
  for (let i = 0; i < records.length; i += 500) {
    const chunk = records.slice(i, i + 500);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ck_asset_mapping?on_conflict=original_url`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Mapping save warning: ${errText}`);
    }
  }
}

// Get existing mapping
async function getMapping() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ck_asset_mapping?select=original_url,new_url&limit=10000`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) return {};
  const data = await res.json();
  const map = {};
  data.forEach(row => { map[row.original_url] = row.new_url; });
  return map;
}

// Scan all entities — proper pagination with skip
async function scanEntity(base44, entityName, urlSet, logger = console) {
  let totalRecords = 0;
  let totalUrls = 0;
  const pageSize = 200;
  let skip = 0;

  while (true) {
    let records = [];
    try {
      // Base44 SDK pagination: list(sort, limit, skip)
      records = await base44.asServiceRole.entities[entityName].list('-created_date', pageSize, skip);
    } catch (err) {
      logger.warn(`[${entityName}] fetch error at skip=${skip}: ${err.message}`);
      break;
    }

    if (!records || records.length === 0) break;

    records.forEach(rec => {
      const before = urlSet.size;
      extractUrls(rec, urlSet);
      totalUrls += (urlSet.size - before);
    });

    totalRecords += records.length;
    logger.log(`[${entityName}] scanned ${totalRecords} records, found ${totalUrls} unique URLs so far`);

    if (records.length < pageSize) break;
    skip += pageSize;
    if (skip > 100000) break; // hard safety cap
  }

  return { records: totalRecords, urls: totalUrls };
}

async function scanAllUrls(base44) {
  const allUrls = new Set();
  const summary = {};
  const entitiesToScan = ['Game', 'BBMResource', 'AIStory', 'User', 'UserSubscription'];

  for (const entityName of entitiesToScan) {
    try {
      const result = await scanEntity(base44, entityName, allUrls);
      summary[entityName] = { records: result.records, urls: result.urls };
    } catch (err) {
      console.warn(`Skipping ${entityName}: ${err.message}`);
      summary[entityName] = { records: 0, urls: 0, error: err.message };
    }
  }

  return { urls: Array.from(allUrls), summary };
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Supabase secrets not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'scan';

    // ── ACTION 1: SCAN ONLY ──
    if (action === 'scan') {
      console.log('🔍 Scanning all entities for Base44 image URLs...');
      const { urls, summary } = await scanAllUrls(base44);
      return Response.json({
        success: true,
        action: 'scan',
        totalUrls: urls.length,
        summary,
        sampleUrls: urls.slice(0, 20),
        message: `Found ${urls.length} unique Base44 image URLs. Run action=backup to download them.`,
      });
    }

    // ── ACTION 2: GET CURRENT MANIFEST ──
    if (action === 'manifest') {
      const mapping = await getMapping();
      return Response.json({
        success: true,
        action: 'manifest',
        totalMapped: Object.keys(mapping).length,
        mapping,
      });
    }

    // ── ACTION 3: FULL BACKUP ──
    if (action === 'backup') {
      console.log('💾 Starting full asset backup...');
      const { urls } = await scanAllUrls(base44);
      const existingMapping = await getMapping();
      const newMapping = {};
      const errors = [];
      let backed = 0;
      let skipped = 0;
      const maxToProcess = body.limit || 50; // safety cap per run (small for timeout safety)
      const concurrency = body.concurrency || 8;

      // First filter out already-backed-up URLs, THEN take the next batch
      const pending = urls.filter(url => {
        if (existingMapping[url]) { skipped++; return false; }
        return true;
      });
      const todo = pending.slice(0, maxToProcess);

      // Process one URL — download from Base44, upload to Supabase
      const processOne = async (url) => {
        try {
          const path = urlToPath(url);
          const imgRes = await fetch(url);
          if (!imgRes.ok) {
            errors.push({ url, error: `Fetch failed: ${imgRes.status}` });
            return;
          }
          const contentType = imgRes.headers.get('content-type') || 'image/png';
          const blob = await imgRes.blob();
          const newUrl = await uploadToSupabase(path, blob, contentType);
          newMapping[url] = newUrl;
          backed++;
        } catch (err) {
          errors.push({ url, error: err.message });
        }
      };

      // Run in parallel batches of `concurrency`
      for (let i = 0; i < todo.length; i += concurrency) {
        const batch = todo.slice(i, i + concurrency);
        await Promise.all(batch.map(processOne));
        console.log(`Progress: ${Math.min(i + concurrency, todo.length)}/${todo.length} processed`);
      }

      // Save mapping to DB
      if (Object.keys(newMapping).length > 0) {
        await saveMapping(newMapping);
      }

      return Response.json({
        success: true,
        action: 'backup',
        totalFound: urls.length,
        newlyBackedUp: backed,
        alreadyBackedUp: skipped,
        errors: errors.slice(0, 10),
        errorCount: errors.length,
        remaining: Math.max(0, urls.length - maxToProcess),
        message: backed > 0
          ? `Successfully backed up ${backed} new images. ${urls.length - maxToProcess > 0 ? `Run again to process remaining ${urls.length - maxToProcess}.` : 'All done!'}`
          : 'No new images to backup.',
      });
    }

    return Response.json({ error: `Unknown action: ${action}. Use: scan | backup | manifest` }, { status: 400 });
  } catch (error) {
    console.error('backupAllAssets error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});