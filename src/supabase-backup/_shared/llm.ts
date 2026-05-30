// Unified LLM helper — replaces Base44 InvokeLLM with direct OpenAI API calls
// All AI generator edge functions (askAI, story, BBM, quiz) use this.
//
// Requires: OPENAI_API_KEY env var (set via `supabase secrets set OPENAI_API_KEY=sk-...`)
//
// Model mapping (Base44 → OpenAI):
//   gpt_5_mini  → gpt-4o-mini   (cheap, fast — tutor + quiz)
//   gpt_5_4     → gpt-4o        (higher quality — story + BBM)

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

const MODEL_MAP: Record<string, string> = {
  gpt_5_mini: 'gpt-4o-mini',
  gpt_5_4: 'gpt-4o',
  gpt_5_5: 'gpt-4o',
  automatic: 'gpt-4o-mini',
};

export interface InvokeLLMOptions {
  prompt: string;
  model?: string;
  response_json_schema?: any;
  add_context_from_internet?: boolean;
  file_urls?: string[];
}

/**
 * Call OpenAI Chat Completions. Returns the assistant text (or parsed object if schema given).
 * Throws on failure — caller is responsible for refunding credits.
 */
export async function invokeLLM(opts: InvokeLLMOptions): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const model = MODEL_MAP[opts.model || 'gpt_5_mini'] || 'gpt-4o-mini';
  const wantsJson = !!opts.response_json_schema;

  const messages: any[] = [];

  // Vision support via file_urls
  if (opts.file_urls && opts.file_urls.length > 0) {
    const content: any[] = [{ type: 'text', text: opts.prompt }];
    for (const url of opts.file_urls) {
      content.push({ type: 'image_url', image_url: { url } });
    }
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: opts.prompt });
  }

  const body: any = {
    model,
    messages,
    temperature: 0.8,
  };

  if (wantsJson) {
    body.response_format = { type: 'json_object' };
    // Inject schema hint into prompt (OpenAI ignores raw json_schema in chat completions)
    const schemaHint = `\n\nJawab WAJIB dalam JSON sahaja dengan struktur tepat ini: ${JSON.stringify(opts.response_json_schema)}`;
    if (typeof messages[0].content === 'string') {
      messages[0].content += schemaHint;
    } else {
      messages[0].content[0].text += schemaHint;
    }
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';

  if (wantsJson) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('LLM returned invalid JSON: ' + text.slice(0, 200));
    }
  }
  return text;
}

/**
 * Generate an image using OpenAI DALL-E 3. Returns { url: string }.
 */
export async function generateImage(prompt: string): Promise<{ url: string }> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DALL-E API ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  return { url: data?.data?.[0]?.url || '' };
}