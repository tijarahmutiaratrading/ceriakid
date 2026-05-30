// Generate Story Kid using OpenAI (Cikgu Mira interactive stories)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { invokeLLM, generateImage } from '../_shared/llm.ts';

const STORY_THEMES = [
  { theme: 'tolong haiwan', moral: 'Sayangi haiwan', emoji: '🐾' },
  { theme: 'jaga alam sekitar', moral: 'Jaga alam', emoji: '🌳' },
  { theme: 'belajar membaca', moral: 'Belajar itu seronok', emoji: '📚' },
  { theme: 'mengira buah-buahan', moral: 'Matematik di sekeliling kita', emoji: '🍎' },
  { theme: 'misi angkasa', moral: 'Berani mencuba', emoji: '🚀' },
  { theme: 'membantu kawan', moral: 'Persahabatan indah', emoji: '🤝' },
  { theme: 'patuh keselamatan jalan raya', moral: 'Keselamatan utama', emoji: '🚦' },
  { theme: 'tabiat sihat', moral: 'Hidup sihat', emoji: '🥗' },
  { theme: 'cuci tangan dan kebersihan', moral: 'Kebersihan asas kesihatan', emoji: '🧼' },
  { theme: 'tolong ibu di rumah', moral: 'Membantu keluarga itu mulia', emoji: '🏠' },
];

const CHARACTERS = [
  { name: 'Aina', gender: 'girl', look: 'a cheerful 5-year-old Malay girl with short black hair in pigtails, wearing a yellow t-shirt' },
  { name: 'Ali', gender: 'boy', look: 'a brave 5-year-old Malay boy with short black hair, wearing a blue t-shirt' },
  { name: 'Sara', gender: 'girl', look: 'a kind 5-year-old Malay girl with long black hair, wearing a green dress' },
  { name: 'Aiman', gender: 'boy', look: 'a curious 5-year-old Malay boy with messy black hair, wearing a red t-shirt' },
];

function buildPrompt(theme: any, character: any): string {
  return `You are a Malaysian children's story writer for kids ages 4-6.

THEME: ${theme.theme}
MORAL: ${theme.moral}
CHARACTER: ${character.name} (${character.gender})

Write in BAHASA MELAYU. Short sentences. 9 scenes total.
Each scene: 1-2 short sentences (max 15 words) + choices.
Most scenes have 2 choices (good: star:true, bad: no star).
Last scene (9th): 1 choice {text:"Tamat cerita", next:"end", star:true}.
"next" = index 0-8 OR "end".
Include "visualHint" in English per scene (5-15 words, scene description only).

Return ONLY JSON: {"title":"...", "emoji":"${theme.emoji}", "moral":"${theme.moral}", "scenes":[{"text":"...","visualHint":"...","choices":[{"text":"...","next":1,"star":true}]}]}`;
}

function validateStory(story: any): string[] {
  const errors: string[] = [];
  if (!story?.title) errors.push('no title');
  if (!Array.isArray(story?.scenes) || story.scenes.length !== 9) errors.push(`scenes ${story?.scenes?.length}`);
  for (const [i, s] of (story.scenes || []).entries()) {
    if (!s.text || s.text.length < 5) errors.push(`scene ${i} bad text`);
    if (!Array.isArray(s.choices) || s.choices.length < 1) errors.push(`scene ${i} no choices`);
  }
  return errors;
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') return jsonResponse({ error: 'Forbidden: Admin only' }, 403);

    const { targetCount = 30 } = await req.json().catch(() => ({}));

    const { data: existing } = await supabaseAdmin
      .from('ck_games')
      .select('id, game_data')
      .eq('category', 'story')
      .eq('type', 'story_adventure')
      .eq('is_published', true);

    const existingCount = existing?.length || 0;
    const needed = Math.max(0, targetCount - existingCount);
    if (needed === 0) return jsonResponse({ success: true, message: `Already has ${existingCount}`, generated: 0 });

    // Rotate themes — pick one not yet used (or least used)
    const themeCounts = new Map(STORY_THEMES.map(t => [t.theme, 0]));
    (existing || []).forEach((g: any) => {
      const key = g.game_data?.themeKey;
      if (key && themeCounts.has(key)) themeCounts.set(key, (themeCounts.get(key) || 0) + 1);
    });
    const sorted = [...STORY_THEMES].sort((a, b) =>
      (themeCounts.get(a.theme) || 0) - (themeCounts.get(b.theme) || 0));

    const themeObj = sorted[0];
    const character = CHARACTERS[existingCount % CHARACTERS.length];

    let story: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await invokeLLM({
          prompt: buildPrompt(themeObj, character),
          model: 'gpt_5_4',
          response_json_schema: { type: 'object' },
        });
        if (validateStory(result).length === 0) { story = result; break; }
      } catch (e) { console.log('attempt failed:', (e as Error).message); }
    }
    if (!story) return jsonResponse({ success: true, generated: 0, failed: 1, error: 'Generation failed' });

    // Generate cover image
    let coverUrl = '';
    try {
      const imgPrompt = `${character.look} ${story.scenes[0]?.visualHint || themeObj.theme}. Style: 3D Pixar render, soft lighting, vibrant, kid-friendly, no text.`;
      const img = await generateImage(imgPrompt);
      coverUrl = img?.url || '';
    } catch (e) { console.log('cover image:', (e as Error).message); }

    // Skip per-scene images for now (10 DALL-E calls = expensive). Use cover only.
    const scenesWithImages = story.scenes.map((s: any) => ({ ...s, imageUrl: coverUrl, image: story.emoji || themeObj.emoji }));

    await supabaseAdmin.from('ck_games').insert({
      title: story.title,
      description: story.moral || themeObj.moral,
      type: 'story_adventure', category: 'story', age_group: 'prasekolah',
      difficulty: 'easy', tier: 'free',
      emoji: story.emoji || themeObj.emoji,
      total_questions: story.scenes.length,
      game_data: {
        storyKid: true,
        themeKey: themeObj.theme,
        cover: coverUrl,
        moral: story.moral || themeObj.moral,
        character: { name: character.name, gender: character.gender },
        scenes: scenesWithImages,
      },
      is_published: true, status: 'ready',
      order: existingCount + 1,
      month_tag: new Date().toISOString().slice(0, 7),
    });

    return jsonResponse({
      success: true, existing: existingCount, generated: 1, failed: 0,
      stillNeeded: needed - 1,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});