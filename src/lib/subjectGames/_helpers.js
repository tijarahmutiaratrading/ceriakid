// Hand-crafted subject games — helpers untuk pastikan kualiti konsisten.
//
// SETIAP game blueprint mesti ikut struktur ini:
// {
//   id: 'unique-id',                  // unique key (slug)
//   title: 'Tajuk dalam BM',         // tajuk paparan
//   emoji: '📚',                      // ikon
//   subject: 'bahasa_melayu',        // category (subject)
//   ageGroup: 'prasekolah' | 'sekolah_rendah',
//   darjah: null | 'darjah_1'..'darjah_6',
//   difficulty: 'easy' | 'medium' | 'hard',
//   topic: 'Huruf Vokal',            // topik KSSR
//   questions: [{ problem, options, answer, emoji }, ...]   // 10 soalan
// }
//
// PERATURAN KUALITI:
// 1. Setiap soalan WAJIB ada exactly 4 options (kecuali yes_no = 2)
// 2. `answer` adalah index (0-3) ke option yang BETUL
// 3. JANGAN guna index 0 setiap kali (elak AI lazy pattern)
// 4. Bahasa konsisten — soalan BM, jawapan BM (no English mix)
// 5. Emoji setiap soalan WAJIB relevan dengan content
// 6. Difficulty padan dengan tahap (prasekolah=easy/medium sahaja; darjah_1=easy/medium)
// 7. Fakta WAJIB disahkan — math correct, sains correct, ejaan correct

export function buildGameRecord(blueprint) {
  // Convert blueprint to Game entity format
  return {
    title: blueprint.title,
    description: blueprint.topic ? `Topik: ${blueprint.topic}` : null,
    type: 'multiple_choice',  // unified type — QuestionRenderer handle all via options
    category: blueprint.subject,
    ageGroup: blueprint.ageGroup,
    darjah: blueprint.darjah || null,
    difficulty: blueprint.difficulty || 'easy',
    tier: blueprint.tier || 'free',
    emoji: blueprint.emoji,
    totalQuestions: blueprint.questions.length,
    gameData: {
      questions: blueprint.questions.map(q => ({
        type: 'multiple_choice',
        problem: q.problem,
        options: q.options,
        answer: q.answer,
        emoji: q.emoji || blueprint.emoji,
      })),
    },
    isPublished: true,
    status: 'ready',
    order: blueprint.order || 0,
    monthTag: '2026-05',
  };
}

export function validateBlueprint(bp) {
  const errors = [];
  if (!bp.id) errors.push('Missing id');
  if (!bp.title) errors.push('Missing title');
  if (!bp.subject) errors.push('Missing subject');
  if (!bp.ageGroup) errors.push('Missing ageGroup');
  if (!Array.isArray(bp.questions) || bp.questions.length < 5) errors.push(`Need ≥5 questions (got ${bp.questions?.length || 0})`);
  bp.questions?.forEach((q, i) => {
    if (!q.problem) errors.push(`Q${i+1}: missing problem`);
    if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`Q${i+1}: need exactly 4 options`);
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) errors.push(`Q${i+1}: answer must be 0-3`);
  });
  // Check answer distribution — flag if all answers same index (AI lazy pattern)
  const dist = [0,0,0,0];
  bp.questions?.forEach(q => { if (q.answer >= 0 && q.answer <= 3) dist[q.answer]++; });
  if (dist.some(d => d === bp.questions?.length)) errors.push('All answers at same index — looks like AI lazy pattern');
  return errors;
}