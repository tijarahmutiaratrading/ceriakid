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

const STORY_IMAGES = [
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f57f9479f_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0a97ddf90_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3ff2b9379_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fdbdb4e85_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f4b720a6a_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3c03de7fd_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/44f9e58a4_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d52325143_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7055e89d0_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/32fd99f2b_generated_image.png',
];

function buildPrompt({ theme, moral, emoji }) {
  return `You are a Malaysian children's story writer creating an interactive story for kids ages 4-6 (Prasekolah).

STORY THEME: ${theme}
MORAL LESSON: ${moral}
ICON: ${emoji}

REQUIREMENTS:
1. Write entirely in BAHASA MELAYU. No English mixing.
2. Use simple, short sentences suitable for kids ages 4-6.
3. Create 9 scenes total, each with text + 1-2 choice options.
4. Each scene's text MUST be 1-2 short sentences (max 15 words).
5. Each choice should be 2-5 words only.
6. Mark the GOOD/CORRECT choice with star: true. Bad choice has no star.
7. Most scenes should have 2 choices. The LAST scene (scene 9) has only 1 choice: { text: "Tamat cerita", next: "end", star: true }.
8. The "next" field shows which scene to go to next (0-8 for scenes, "end" to finish).
9. Good choices progress story forward (next: currentIndex+1). Bad choices either repeat or skip with consequences.
10. Use a Malaysian child character (e.g., Ali, Aina, Sara, Bobo, Nia, Aiman, Lisa, etc.) — pick one suitable.
11. The story must teach the moral lesson naturally.

Return ONLY valid JSON in this exact format:
{
  "title": "Story title (3-5 words in BM)",
  "emoji": "${emoji}",
  "moral": "${moral}",
  "scenes": [
    { "text": "Scene 1 description...", "choices": [{ "text": "Good choice", "next": 1, "star": true }, { "text": "Bad choice", "next": 2 }] },
    { "text": "Scene 2...", "choices": [{ "text": "...", "next": 3, "star": true }, { "text": "...", "next": 2 }] },
    ...
    { "text": "Scene 9 happy ending...", "choices": [{ "text": "Tamat cerita", "next": "end", "star": true }] }
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

async function generateOneStory(base44, themeObj) {
  const prompt = buildPrompt(themeObj);
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

    // Pick themes not yet used (rough check by theme keyword)
    const existingTitles = new Set(existing.map(g => (g.title || '').toLowerCase()));
    const remainingThemes = STORY_THEMES.filter(t =>
      !Array.from(existingTitles).some(et => et.includes(t.theme.split(' ')[0]))
    );

    // Limit batch size — 5 stories per call (timeout safety)
    const batchSize = Math.min(needed, 5, remainingThemes.length);
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < batchSize; i++) {
      const themeObj = remainingThemes[i];
      const result = await generateOneStory(base44, themeObj);

      if (result.ok) {
        const s = result.story;
        // Attach images to scenes (rotate through STORY_IMAGES)
        const scenesWithImages = s.scenes.map((scene, idx) => ({
          ...scene,
          imageUrl: STORY_IMAGES[idx % STORY_IMAGES.length],
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
            cover: STORY_IMAGES[i % STORY_IMAGES.length],
            moral: s.moral || themeObj.moral,
            scenes: scenesWithImages,
          },
          isPublished: true,
          status: 'ready',
          order: existing.length + i + 1,
          monthTag: '2026-05',
        });
        inserted++;
      } else {
        failed++;
      }
    }

    const stillNeeded = needed - inserted;
    return Response.json({
      success: true,
      existing: existing.length,
      generated: inserted,
      failed,
      stillNeeded,
      message: stillNeeded > 0
        ? `✅ Generated ${inserted}/${batchSize}. Run again to continue (${stillNeeded} more needed).`
        : `✅ Story Kid complete dengan ${existing.length + inserted} stories.`,
    });
  } catch (error) {
    console.error('launchGenerateStoryKid error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});