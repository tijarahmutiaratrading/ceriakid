// NOTE: Dalam Supabase, assets sudah di Supabase Storage — TIDAK PERLU backup
// dari Base44 lagi. Function ini return no-op untuk compatibility.
//
// Kalau ada asset Base44 yang belum migrate, run satu kali via Base44 (original).
import { jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (_req) => {
  return jsonResponse({
    success: true,
    status: 'noop',
    message: 'Assets already in Supabase Storage. Use ck_asset_mapping table to resolve old Base44 URLs.',
    backed_up: 0,
  });
});