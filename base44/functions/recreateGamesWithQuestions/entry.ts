import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = [
  { ageGroup: 'prasekolah', category: 'bahasa_melayu', label: 'Prasekolah BM' },
  { ageGroup: 'prasekolah', category: 'english', label: 'Prasekolah EN' },
  { ageGroup: 'prasekolah', category: 'mathematics', label: 'Prasekolah Math' },
  { ageGroup: 'prasekolah', category: 'science', label: 'Prasekolah Sains' },
  { ageGroup: 'sekolah_rendah', category: 'bahasa_melayu', label: 'SR BM' },
  { ageGroup: 'sekolah_rendah', category: 'english', label: 'SR EN' },
  { ageGroup: 'sekolah_rendah', category: 'mathematics', label: 'SR Math' },
  { ageGroup: 'sekolah_rendah', category: 'science', label: 'SR Sains' },
];

const GAME_TYPES = ['multiple_choice', 'picture_quiz', 'drag_drop', 'memory_game', 'word_builder', 'counting', 'spelling', 'reading'];

async function generateQuestions(base44, subject, gameTitle, count = 10) {
  const prompt = `Buat TEPAT ${count} soalan untuk: "${gameTitle}" (${subject})

Output JSON array "questions" dengan setiap soalan:
{ problem, options: [A,B,C,D], answer: 0-3, emoji }`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'gpt_5_mini',
    response_json_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              problem: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              answer: { type: 'number' },
              emoji: { type: 'string' },
            },
          },
        },
      },
    },
  });

  return (result.questions || []).filter(q => q?.problem && q?.options?.length === 4 && q?.answer !== undefined && q?.emoji).slice(0, count);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('🗑️ Deleting all games...');
    const allGames = await base44.asServiceRole.entities.Game.filter({});
    for (const g of allGames) {
      await base44.asServiceRole.entities.Game.delete(g.id);
    }
    console.log(`Deleted ${allGames.length} games`);

    let totalCreated = 0;
    let totalFailed = 0;

    // Create 10 games per subject
    for (const subject of SUBJECTS) {
      console.log(`\n📚 Creating games for ${subject.label}...`);
      
      for (let gameNum = 1; gameNum <= 10; gameNum++) {
        const gameType = GAME_TYPES[(gameNum - 1) % GAME_TYPES.length];
        const gameTitle = `${subject.label} Game ${gameNum}`;

        try {
          console.log(`  Generating ${gameTitle}...`);
          const questions = await generateQuestions(base44, subject.label, gameTitle, 10);

          if (!questions || questions.length === 0) {
            console.warn(`  ⚠️ No questions for ${gameTitle}`);
            totalFailed++;
            continue;
          }

          const game = await base44.asServiceRole.entities.Game.create({
            title: gameTitle,
            type: gameType,
            category: subject.category,
            ageGroup: subject.ageGroup,
            difficulty: gameNum % 3 === 0 ? 'easy' : gameNum % 3 === 1 ? 'medium' : 'hard',
            tier: 'free',
            emoji: questions[0].emoji,
            totalQuestions: questions.length,
            gameData: { questions },
            isPublished: true,
            status: 'ready',
            order: gameNum - 1,
          });

          totalCreated++;
          console.log(`  ✅ Created ${gameTitle} (${questions.length} Q)`);

          // Delay to avoid rate limits
          await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
          console.error(`  ❌ Error: ${err.message}`);
          totalFailed++;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    return Response.json({
      success: true,
      totalCreated,
      totalFailed,
      message: `✅ Done! Created ${totalCreated} games with 10 questions each. ${totalFailed} failed.`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});