// Service-role Supabase client + helper to extract authenticated user from request
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — edge function will not work');
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Verify Authorization: Bearer <jwt> and return { id, email, role, full_name } or null
export async function getUserFromRequest(req: Request): Promise<any | null> {
  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return null;

    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user || !user.email) return null;

    // Merge profile fields (role, full_name, phone) from ck_users
    const { data: profile } = await supabaseAdmin
      .from('ck_users')
      .select('*')
      .eq('email', user.email.toLowerCase())
      .maybeSingle();

    return {
      id: user.id,
      email: user.email.toLowerCase(),
      role: profile?.role || 'user',
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      ...profile,
    };
  } catch (e) {
    console.error('getUserFromRequest error:', e);
    return null;
  }
}