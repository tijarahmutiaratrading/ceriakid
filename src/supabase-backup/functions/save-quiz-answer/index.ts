// Save quiz answer to history
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireUser } from '../_shared/authGuards.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const guard = await requireUser(req);
  if (guard instanceof Response) return guard;
  const { user } = guard;

  try {
    const {
      question, choices, correctIndex, userAnswerIndex, isCorrect,
      explanation, hint, encouragement, emoji,
      subject, level, difficulty, topic,
    } = await req.json();

    if (!question || !Array.isArray(choices)) {
      return jsonResponse({ error: 'Invalid quiz data' }, 400);
    }

    const { data: saved } = await supabaseAdmin
      .from('ck_quiz_history')
      .insert({
        question,
        choices,
        correct_index: correctIndex,
        user_answer_index: userAnswerIndex,
        is_correct: !!isCorrect,
        explanation: explanation || '',
        hint: hint || '',
        encouragement: encouragement || '',
        emoji: emoji || '❓',
        subject: subject || 'general',
        level: level || '',
        difficulty: difficulty || 'medium',
        topic: topic || '',
        created_by: user.email,
      })
      .select()
      .single();

    return jsonResponse({ success: true, id: saved?.id });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});