// Shared auth guards untuk admin / scheduled / public endpoints
import { getUserFromRequest } from './supabaseAdmin.ts';
import { jsonResponse } from './cors.ts';

// Admin-only — return error response kalau bukan admin, else null
export async function requireAdmin(req: Request): Promise<Response | { user: any }> {
  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);
  if (user.role !== 'admin') return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
  return { user };
}

// Authenticated user — any role
export async function requireUser(req: Request): Promise<Response | { user: any }> {
  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);
  return { user };
}

// Allow admin OR scheduled call (body has scheduled:true OR automation.type==='scheduled')
export async function requireAdminOrScheduled(req: Request): Promise<Response | { user: any | null; isScheduled: boolean }> {
  let isScheduled = false;
  try {
    const body = await req.clone().json();
    if (body?.scheduled === true || body?.automation?.type === 'scheduled') {
      isScheduled = true;
    }
  } catch { /* no body */ }

  if (isScheduled) return { user: null, isScheduled: true };

  const user = await getUserFromRequest(req);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);
  if (user.role !== 'admin') return jsonResponse({ error: 'Forbidden: Admin only' }, 403);
  return { user, isScheduled: false };
}