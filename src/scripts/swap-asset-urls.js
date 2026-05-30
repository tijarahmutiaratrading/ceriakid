#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * swap-asset-urls.js
 *
 * NOTE: This is a Node.js CLI script, NOT browser code.
 * It uses Node globals (require, process) which lint rules don't recognize.
 * Run via: node scripts/swap-asset-urls.js
 *
 * Migration helper: scan semua source files (.js/.jsx/.ts/.tsx/.md/.html/.json)
 * dan replace hardcoded `https://media.base44.com/...` URLs dengan Supabase
 * Storage equivalents berdasarkan mapping yang disimpan dalam `ck_asset_mapping` table.
 *
 * USAGE:
 *   1. Set env vars dulu:
 *        export SUPABASE_URL="https://xxx.supabase.co"
 *        export SUPABASE_SERVICE_KEY="eyJ..."   # service role key
 *
 *   2. (Optional) preview dulu tanpa write:
 *        node scripts/swap-asset-urls.js --dry-run
 *
 *   3. Run untuk replace:
 *        node scripts/swap-asset-urls.js
 *
 * WHAT IT DOES:
 *   - Fetch mapping dari Supabase: { original_url → new_url }
 *   - Scan recursive folder `src/` (boleh tukar via --dir=...)
 *   - Replace setiap match in-place
 *   - Print summary: berapa files affected, berapa URLs replaced
 *
 * SAFETY:
 *   - Skip node_modules, .git, dist, build folders automatically
 *   - Dry-run mode: tunjuk apa nak tukar tanpa write
 *   - Skip URLs yang takde dalam mapping (no orphan replacement)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Config ──
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const dirArg = args.find(a => a.startsWith('--dir='));
const ROOT_DIR = dirArg ? dirArg.split('=')[1] : path.join(process.cwd(), 'src');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.md', '.html', '.json', '.css']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.cache']);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_KEY first.');
  process.exit(1);
}

if (!fs.existsSync(ROOT_DIR)) {
  console.error(`❌ Directory not found: ${ROOT_DIR}`);
  process.exit(1);
}

// ── Fetch URL mapping from Supabase ──
function fetchMapping() {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/ck_asset_mapping?select=original_url,new_url&limit=10000`;
    https.get(url, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`Supabase ${res.statusCode}: ${data}`));
        try {
          const rows = JSON.parse(data);
          const map = {};
          rows.forEach(r => { map[r.original_url] = r.new_url; });
          resolve(map);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ── Recursive file walker ──
function walkFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, files);
    else if (EXTENSIONS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

// ── Main ──
(async () => {
  console.log(`🔍 Fetching URL mapping from Supabase...`);
  const mapping = await fetchMapping();
  const mappingKeys = Object.keys(mapping);
  console.log(`✓ Loaded ${mappingKeys.length} URL mappings\n`);

  if (mappingKeys.length === 0) {
    console.error('❌ No mappings found. Run backupAllAssets first to populate ck_asset_mapping.');
    process.exit(1);
  }

  console.log(`📂 Scanning: ${ROOT_DIR}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'WRITE MODE'}\n`);

  const files = walkFiles(ROOT_DIR);
  console.log(`✓ Found ${files.length} source files\n`);

  let filesChanged = 0;
  let totalReplacements = 0;
  const sampleChanges = [];

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileReplaceCount = 0;

    // Sort keys longest-first to avoid partial overlaps
    const sortedKeys = mappingKeys.sort((a, b) => b.length - a.length);

    for (const oldUrl of sortedKeys) {
      if (content.includes(oldUrl)) {
        const newUrl = mapping[oldUrl];
        // Escape regex special chars for global replace
        const escaped = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matches = content.match(new RegExp(escaped, 'g'));
        if (matches) {
          fileReplaceCount += matches.length;
          content = content.split(oldUrl).join(newUrl);
        }
      }
    }

    if (fileReplaceCount > 0) {
      filesChanged++;
      totalReplacements += fileReplaceCount;
      if (sampleChanges.length < 5) {
        sampleChanges.push({ file: file.replace(process.cwd(), '.'), count: fileReplaceCount });
      }
      if (!DRY_RUN) fs.writeFileSync(file, content, 'utf8');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 SUMMARY`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Files scanned:       ${files.length}`);
  console.log(`Files changed:       ${filesChanged}`);
  console.log(`URLs replaced:       ${totalReplacements}`);
  console.log(`Mode:                ${DRY_RUN ? 'DRY RUN — nothing written' : '✓ WRITTEN'}`);
  console.log('');

  if (sampleChanges.length > 0) {
    console.log('Sample affected files:');
    sampleChanges.forEach(s => console.log(`  • ${s.file} (${s.count} URLs)`));
    console.log('');
  }

  if (DRY_RUN) {
    console.log('💡 Re-run without --dry-run to apply changes.');
  } else if (filesChanged > 0) {
    console.log('✅ Done! Test the app, then commit:');
    console.log('   git add -A && git commit -m "chore: swap Base44 asset URLs → Supabase Storage"');
  } else {
    console.log('✓ No Base44 URLs found in source. Already migrated or none to swap.');
  }
})().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});