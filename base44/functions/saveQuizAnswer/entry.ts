import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      question, choices, correctIndex, userAnswerIndex, isCorrect,
      explanation, hint, encouragement, emoji,
      subject, level, difficulty, topic,
    } = await req.json();

    if (!question || !Array.isArray(choices)) {
      return Response.json({ error: 'Invalid quiz data' }, { status: 400 });
    }

    const saved = await base44.entities.QuizHistory.create({
      question,
      choices,
      correctIndex,
      userAnswerIndex,
      isCorrect: !!isCorrect,
      explanation: explanation || '',
      hint: hint || '',
      encouragement: encouragement || '',
      emoji: emoji || '❓',
      subject: subject || 'general',
      level: level || '',
      difficulty: difficulty || 'medium',
      topic: topic || '',
    });

    return Response.json({ success: true, id: saved?.id });
  } catch (error) {
    console.error('saveQuizAnswer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});