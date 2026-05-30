// Shared stub helper untuk admin generator/QC functions
// Return helpful message tanpa execute complex logic
import { handleCors, jsonResponse } from './cors.ts';
import { requireAdmin } from './authGuards.ts';

export async function adminStub(req: Request, functionName: string): Promise<Response> {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  return jsonResponse({
    success: false,
    status: 'not_implemented',
    function: functionName,
    message: `${functionName} is a stub in the Supabase backup. Game content generation and QC logic requires full translation from Base44 InvokeLLM prompts. See _STUBS_README.md.`,
    fallback: 'Use Base44 dashboard while operational, or implement manually using OpenAI API.',
  });
}