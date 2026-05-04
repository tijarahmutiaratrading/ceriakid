import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription tier
    const subs = await base44.entities.UserSubscription.filter({ email: user.email });
    const sub = subs[0];
    const notExpired = !sub?.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date();
    const tier = (sub?.status === 'active' || sub?.status === 'trial') && notExpired ? (sub?.tier || 'free') : 'free';

    const premiumTiers = ['premium', 'pro', 'keluarga', 'standard', 'asas'];
    if (!premiumTiers.includes(tier)) {
      return Response.json({ error: 'premium_required' }, { status: 403 });
    }

    const { category, ageGroup, count = 20, previousQuestions = [] } = await req.json();

    const SUBJECT_LABELS = {
      bahasa_melayu: 'Bahasa Melayu',
      english: 'English Language',
      mathematics: 'Mathematics',
      science: 'Science',
      jawi: 'Jawi',
      bahasa_tamil: 'Tamil Language',
      bahasa_mandarin: 'Mandarin Language',
    };

    const AGE_LABELS = {
      prasekolah: 'preschool children aged 4-6',
      sekolah_rendah: 'primary school children aged 7-12',
    };

    const subjectLabel = SUBJECT_LABELS[category] || category;
    const ageLabel = AGE_LABELS[ageGroup] || ageGroup;

    // Extract previous question texts to avoid repeating them
    const prevTexts = previousQuestions
      .map(q => q.problem || q.question || '')
      .filter(Boolean)
      .slice(0, 10)
      .join('\n- ');

    const avoidSection = prevTexts ? `\nAVOID repeating these topics/questions from the previous session:\n- ${prevTexts}` : '';

    const prompt = `Generate ${count} fresh multiple-choice quiz questions for ${subjectLabel} for ${ageLabel}.
${avoidSection}

Rules:
- Each question must be on a DIFFERENT topic/concept from others
- Age-appropriate difficulty and vocabulary
- 4 answer options (A, B, C, D)
- answer field is the index (0=A, 1=B, 2=C, 3=D) of the correct answer
- Include a fun emoji relevant to the question topic

Return ONLY valid JSON array (no markdown):
[
  {
    "problem": "Apakah nama ibu kota Malaysia?",
    "options": ["Kuala Lumpur", "Johor Bahru", "Penang", "Kota Kinabalu"],
    "answer": 0,
    "emoji": "🏙️"
  }
]`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
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

    // Handle both array and object responses
    let questions = Array.isArray(result) ? result : (result?.questions || []);

    // Validate
    questions = questions.filter(q =>
      q.problem && Array.isArray(q.options) && q.options.length >= 2 && typeof q.answer === 'number'
    ).slice(0, count);

    return Response.json({ success: true, questions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});