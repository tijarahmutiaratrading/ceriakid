import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REPLACEMENTS = [
  {
    match: 'boleh terbang di taman',
    question: {
      problem: 'Burung boleh buat apa?',
      options: ['Terbang', 'Menyelam', 'Mengaum', 'Memanjat'],
      answer: 0,
      emoji: '🐦'
    }
  },
  {
    match: 'badan kecil dan suka berlari-lari',
    question: {
      problem: 'Haiwan manakah yang suka melompat?',
      options: ['Ikan', 'Arnab', 'Burung', 'Lembu'],
      answer: 1,
      emoji: '🐰'
    }
  },
  {
    match: 'dua telinga panjang',
    question: {
      problem: 'Haiwan manakah yang mempunyai telinga panjang?',
      options: ['Kucing', 'Anjing', 'Arnab', 'Harimau'],
      answer: 2,
      emoji: '🐰'
    }
  }
];

function normalizeQuestion(question) {
  const q = question?.response || question;
  if (!q?.problem || !Array.isArray(q.options) || q.options.length !== 4 || !Number.isInteger(q.answer)) {
    return null;
  }

  const text = String(q.problem).toLowerCase();
  const replacement = REPLACEMENTS.find(item => text.includes(item.match));
  if (replacement) return replacement.question;

  return {
    problem: String(q.problem).trim(),
    options: q.options.map(option => String(option).trim()),
    answer: q.answer,
    emoji: String(q.emoji || '🎮').trim()
  };
}

function makeUnique(questions) {
  const seen = new Set();
  return questions.map((question) => {
    const key = question.problem.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      return question;
    }

    if (key === 'haiwan manakah yang boleh terbang?') {
      return {
        problem: 'Burung boleh buat apa?',
        options: ['Terbang', 'Menyelam', 'Mengaum', 'Memanjat'],
        answer: 0,
        emoji: '🐦'
      };
    }

    return {
      ...question,
      problem: `${question.problem} Pilih jawapan yang betul.`
    };
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.filter({ ageGroup: 'prasekolah', category: 'bahasa_melayu' });
    let updatedGames = 0;
    let repairedQuestions = 0;

    for (const game of games) {
      const originalQuestions = game.gameData?.questions || [];
      const normalized = originalQuestions.map((question) => normalizeQuestion(question)).filter(Boolean);
      const repaired = makeUnique(normalized);

      repairedQuestions += repaired.filter((question, index) => JSON.stringify(question) !== JSON.stringify(originalQuestions[index])).length;

      if (JSON.stringify(repaired) !== JSON.stringify(originalQuestions)) {
        await base44.asServiceRole.entities.Game.update(game.id, {
          totalQuestions: repaired.length,
          gameData: { ...game.gameData, questions: repaired },
          status: 'ready'
        });
        updatedGames++;
      }
    }

    return Response.json({ success: true, updatedGames, repairedQuestions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});