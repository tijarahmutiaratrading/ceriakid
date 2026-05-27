import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Story themes untuk variety
const STORY_THEMES = [
  { theme: 'tolong haiwan', moral: 'Sayangi haiwan dengan cara selamat', emoji: '🐾' },
  { theme: 'jaga alam sekitar', moral: 'Jaga alam dengan tindakan kecil', emoji: '🌳' },
  { theme: 'belajar membaca', moral: 'Belajar perlahan-lahan itu seronok', emoji: '📚' },
  { theme: 'mengira buah-buahan', moral: 'Matematik di sekeliling kita', emoji: '🍎' },
  { theme: 'misi angkasa', moral: 'Berani mencuba dan bekerjasama', emoji: '🚀' },
  { theme: 'membantu kawan', moral: 'Persahabatan itu indah', emoji: '🤝' },
  { theme: 'patuh keselamatan jalan raya', moral: 'Keselamatan utama', emoji: '🚦' },
  { theme: 'tabiat sihat', moral: 'Hidup sihat bermula dari kecil', emoji: '🥗' },
  { theme: 'cuci tangan dan kebersihan', moral: 'Kebersihan asas kesihatan', emoji: '🧼' },
  { theme: 'tolong ibu di rumah', moral: 'Membantu keluarga itu mulia', emoji: '🏠' },
  { theme: 'pergi ke pasar', moral: 'Belajar membeli dengan bijak', emoji: '🛒' },
  { theme: 'meneroka pantai', moral: 'Kagumi ciptaan alam', emoji: '🏖️' },
  { theme: 'taman permainan', moral: 'Berkongsi dengan kawan', emoji: '🎪' },
  { theme: 'cerita kebun sayur', moral: 'Sabar tanam menuai hasil', emoji: '🥬' },
  { theme: 'hari pertama sekolah', moral: 'Berani hadapi cabaran baru', emoji: '🎒' },
  { theme: 'rakan baharu di kelas', moral: 'Bersikap mesra dan baik', emoji: '👫' },
  { theme: 'kucing tersesat', moral: 'Belas kasihan kepada makhluk', emoji: '🐈' },
  { theme: 'membantu jiran', moral: 'Jiran sebagai saudara', emoji: '🏘️' },
  { theme: 'menjaga adik', moral: 'Sayangi adik-beradik', emoji: '👶' },
  { theme: 'cerita Hari Raya', moral: 'Maaf-memaafkan itu mulia', emoji: '🌙' },
];

// Character pool — nama + jantina + Pixar-style appearance description lock
const CHARACTERS = [
  { name: 'Aina', gender: 'girl', look: 'a cheerful 5-year-old Malay girl with short black hair in two small pigtails, big brown eyes, wearing a yellow t-shirt and pink shorts' },
  { name: 'Ali', gender: 'boy', look: 'a brave 5-year-old Malay boy with short black hair, big brown eyes, wearing a blue t-shirt and grey shorts' },
  { name: 'Sara', gender: 'girl', look: 'a kind 5-year-old Malay girl with long black hair tied in a high ponytail, wearing a green dress' },
  { name: 'Aiman', gender: 'boy', look: 'a curious 5-year-old Malay boy with short messy black hair, wearing a red t-shirt and blue jeans' },
  { name: 'Nia', gender: 'girl', look: 'an adventurous 5-year-old Malay girl with curly black hair, wearing a purple t-shirt and white skirt' },
  { name: 'Bobo', gender: 'boy', look: 'a playful 5-year-old Malay boy with short spiky black hair, wearing an orange hoodie and brown shorts' },
  { name: 'Lisa', gender: 'girl', look: 'a smart 5-year-old Malay girl with shoulder-length black hair and round glasses, wearing a teal shirt and beige pants' },
  { name: 'Danish', gender: 'boy', look: 'a friendly 5-year-old Malay boy with neat short black hair, wearing a white polo shirt and dark blue shorts' },
];

function pickCharacter(themeIdx) {
  return CHARACTERS[themeIdx % CHARACTERS.length];
}

function buildPrompt({ theme, moral, emoji }, character) {
  return `You are a Malaysian children's story writer creating an interactive story for kids ages 4-6 (Prasekolah).

STORY THEME: ${theme}
MORAL LESSON: ${moral}
ICON: ${emoji}
MAIN CHARACTER: ${character.name} (a ${character.gender})

REQUIREMENTS:
1. Write entirely in BAHASA MELAYU. No English mixing.
2. Use simple, short sentences suitable for kids ages 4-6.
3. The main character MUST be named "${character.name}" — use this name consistently in every scene.
4. Use correct pronouns: ${character.name} is a ${character.gender}.
5. Create 9 scenes total, each with text + 1-2 choice options.
6. Each scene's text MUST be 1-2 short sentences (max 15 words).
7. Each choice should be 2-5 words only.
8. Mark the GOOD/CORRECT choice with star: true. Bad choice has no star.
9. Most scenes should have 2 choices. The LAST scene (scene 9) has only 1 choice: { text: "Tamat cerita", next: "end", star: true }.
10. The "next" field shows which scene to go to next (0-8 for scenes, "end" to finish).
11. Good choices progress story forward (next: currentIndex+1). Bad choices either repeat or skip with consequences.
12. The story must teach the moral lesson naturally.
13. For each scene, also provide a brief visual description in English (5-15 words) under "visualHint" — describing what's happening in the scene visually (location, action, mood). Do NOT mention the character's appearance — only describe the scene/action. This will be used to generate illustrations.

Return ONLY valid JSON in this exact format:
{
  "title": "Story title (3-5 words in BM)",
  "emoji": "${emoji}",
  "moral": "${moral}",
  "scenes": [
    { "text": "Scene 1 description...", "visualHint": "english visual description of action/scene only", "choices": [{ "text": "Good choice", "next": 1, "star": true }, { "text": "Bad choice", "next": 2 }] },
    ...
    { "text": "Scene 9 happy ending...", "visualHint": "english visual description", "choices": [{ "text": "Tamat cerita", "next": "end", "star": true }] }
  ]
}`;
}

function validateStory(story) {
  const errors = [];
  if (!story.title) errors.push('missing title');
  if (!Array.isArray(story.scenes) || story.scenes.length !== 9) errors.push(`scenes count: ${story.scenes?.length}`);
  (story.scenes || []).forEach((s, i) => {
    if (!s.text || s.text.length < 5) errors.push(`Scene ${i}: bad text`);
    if (!Array.isArray(s.choices) || s.choices.length < 1) errors.push(`Scene ${i}: no choices`);
  });
  return errors;
}

async function generateOneStory(base44, themeObj, character) {
  const prompt = buildPrompt(themeObj, character);
  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_opus_4_7',
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            emoji: { type: 'string' },
            moral: { type: 'string' },
            scenes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  visualHint: { type: 'string' },
                  choices: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        text: { type: 'string' },
                        next: {},
                        star: { type: 'boolean' },
                      },
                      required: ['text', 'next'],
                    },
                  },
                },
                required: ['text', 'choices'],
              },
            },
          },
          required: ['title', 'scenes'],
        },
      });

      let story = result;
      if (result?.response && typeof result.response === 'object') story = result.response;
      else if (result?.response && typeof result.response === 'string') {
        try { story = JSON.parse(result.response); } catch (e) { /* keep */ }
      }
      if (!story?.scenes && story?.story) story = story.story;

      const errors = validateStory(story);
      if (errors.length === 0) return { ok: true, story };
      console.log(`Attempt ${attempt} errors:`, errors.slice(0, 3));
    } catch (e) {
      console.log(`Attempt ${attempt} failed:`, e.message);
    }
  }
  return { ok: false };
}

// Generate Pixar-style image for a scene
async function generateSceneImage(base44, character, visualHint, isCover = false) {
  const baseStyle = '3D Pixar-style render, soft cinematic lighting, vibrant colors, friendly cartoon, kid-friendly, high quality, depth of field, no text, no words';
  const characterDesc = `Main character: ${character.look}.`;
  const sceneDesc = isCover
    ? `Scene: portrait of ${character.name} smiling, ${visualHint}`
    : `Scene: ${visualHint}`;
  const prompt = `${characterDesc} ${sceneDesc}. Style: ${baseStyle}.`;

  try {
    const result = await base44.integrations.Core.GenerateImage({ prompt });
    return result?.url || '';
  } catch (e) {
    console.log('Image gen failed:', e.message);
    return '';
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { targetCount = 30 } = await req.json().catch(() => ({}));

    const existing = await base44.asServiceRole.entities.Game.filter({
      category: 'story',
      type: 'story_adventure',
      isPublished: true,
    });

    const needed = Math.max(0, targetCount - existing.length);
    if (needed === 0) {
      return Response.json({ success: true, message: `Already has ${existing.length} stories`, generated: 0 });
    }

    // Track tema yang dah dijana berdasarkan themeKey dalam gameData (reliable).
    // Fallback: kira berapa kali setiap tema muncul (count map), kemudian pilih
    // tema dengan count paling rendah → guarantee rotation merata.
    const themeCounts = new Map(STORY_THEMES.map(t => [t.theme, 0]));
    existing.forEach(g => {
      const key = g.gameData?.themeKey;
      if (key && themeCounts.has(key)) {
        themeCounts.set(key, themeCounts.get(key) + 1);
      }
    });

    // Sort tema ikut count paling rendah dulu (yang belum dijana akan dipilih dulu)
    const sortedThemes = [...STORY_THEMES].sort((a, b) => {
      const ca = themeCounts.get(a.theme) || 0;
      const cb = themeCounts.get(b.theme) || 0;
      return ca - cb;
    });

    // Image generation is heavy — process 1 story per call (10 images each)
    const batchSize = Math.min(needed, 1);
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < batchSize; i++) {
      const themeObj = sortedThemes[i];
      const themeIdx = existing.length + i; // rotate character across all stories
      const character = pickCharacter(themeIdx);
      const result = await generateOneStory(base44, themeObj, character);

      if (!result.ok) {
        failed++;
        continue;
      }

      const s = result.story;

      // Generate cover image
      const coverHint = s.scenes[0]?.visualHint || themeObj.theme;
      const coverUrl = await generateSceneImage(base44, character, coverHint, true);

      // Generate image for each scene (parallel for speed)
      const scenePromises = s.scenes.map((scene) =>
        generateSceneImage(base44, character, scene.visualHint || themeObj.theme, false)
      );
      const sceneUrls = await Promise.all(scenePromises);

      const scenesWithImages = s.scenes.map((scene, idx) => ({
        ...scene,
        imageUrl: sceneUrls[idx] || coverUrl,
        image: s.emoji || themeObj.emoji,
      }));

      await base44.asServiceRole.entities.Game.create({
        title: s.title,
        description: s.moral || themeObj.moral,
        type: 'story_adventure',
        category: 'story',
        ageGroup: 'prasekolah',
        difficulty: 'easy',
        tier: 'free',
        emoji: s.emoji || themeObj.emoji,
        totalQuestions: s.scenes.length,
        gameData: {
          storyKid: true,
          themeKey: themeObj.theme,
          cover: coverUrl || sceneUrls[0] || '',
          moral: s.moral || themeObj.moral,
          character: { name: character.name, gender: character.gender },
          scenes: scenesWithImages,
        },
        isPublished: true,
        status: 'ready',
        order: existing.length + i + 1,
        monthTag: '2026-05',
      });
      inserted++;
    }

    const stillNeeded = needed - inserted;
    return Response.json({
      success: true,
      existing: existing.length,
      generated: inserted,
      failed,
      stillNeeded,
      message: stillNeeded > 0
        ? `✅ Generated ${inserted}/${batchSize} dengan 10 Pixar images. Run again to continue (${stillNeeded} more needed).`
        : `✅ Story Kid complete dengan ${existing.length + inserted} stories.`,
    });
  } catch (error) {
    console.error('launchGenerateStoryKid error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});