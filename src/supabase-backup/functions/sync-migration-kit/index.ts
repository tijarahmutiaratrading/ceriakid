// NOTE: Sync migration kit (docs) — dalam Supabase context, docs hidup dalam Git.
// Tiada apa nak sync. Return no-op untuk compat.
import { jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (_req) => {
  return jsonResponse({
    success: true,
    status: 'noop',
    message: 'Migration kit lives in git repo. No sync needed in Supabase environment.',
  });
});