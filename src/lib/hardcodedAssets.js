/**
 * Hardcoded Asset Registry
 *
 * Single source of truth untuk semua media.base44.com URLs yang hardcoded
 * dalam JSX/JS source files (tak dalam database entities).
 *
 * Kenapa kita perlukan ini?
 * - backupAllAssets() scan entities (Game, BBM, AIStory) dan auto-backup nested URLs.
 * - TAPI hardcoded URLs dalam JSX (logo, mascot, testimonial avatars) tak dalam DB.
 * - Registry ni jadi "manifest" untuk backup tools.
 *
 * Cara update:
 * 1. Bila tambah image baru hardcoded dalam JSX, tambah URL ke list di bawah.
 * 2. Tekan "Sync Semua Sekarang" button — auto backup ke Supabase Storage.
 *
 * Cara scan & generate (one-off):
 * - Run: ./scripts/find-hardcoded-urls.sh
 * - Paste output ke list di bawah.
 */

export const HARDCODED_ASSET_URLS = [
  // Logo & Brand
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png',

  // Tambah URL hardcoded yang lain di sini bila perlu...
  // Format: 'https://media.base44.com/images/public/...'
];

export const HARDCODED_ASSETS_VERSION = '2026-05-30';