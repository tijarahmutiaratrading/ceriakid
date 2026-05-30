// Story generator (Cikgu Mira) — 5 credits per story
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabaseAdmin.ts';
import { deductCredits, refundCredits } from '../_shared/credits.ts';
import { invokeLLM, generateImage } from '../_shared/llm.ts';

const COST = 5;

const AGE_LABELS: Record<string, string> = {
  '4-6': 'kanak-kanak Prasekolah (4-6 tahun)',
  '7-9': 'kanak-kanak Sekolah Rendah (7-9 tahun)',
  '10-12': 'kanak-kanak Sekolah Rendah atas (10-12 tahun)',
};
const MORAL_LABELS: Record<string, string> = {
  kejujuran: 'Kejujuran', persahabatan: 'Persahabatan', keberanian: 'Keberanian',
  kasih_sayang: 'Kasih sayang keluarga', kerajinan: 'Kerajinan & usaha',
  tolong_menolong: 'Tolong-menolong', menghormati: 'Menghormati orang lain', sabar: 'Kesabaran',
};

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;

  try {
    const user = await getUserFromRequest(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { theme, childName, ageRange, moralLesson, length } = await req.json();
    if (!theme || theme.trim().length < 3) return jsonResponse({ error: 'Tema cerita terlalu pendek' }, 400);

    const deduction = await deductCredits(user.email, COST, 'story_generator',
      `Cerita tema: ${theme.substring(0, 60)}`,
      { theme, childName, ageRange, moralLesson, length, model: 'gpt-4o' });
    if (!deduction.ok) return jsonResponse({ error: 'INSUFFICIENT_CREDITS', balance: deduction.newBalance, required: COST }, 402);

    const ageLabel = AGE_LABELS[ageRange] || AGE_LABELS['7-9'];
    const moralLabel = MORAL_LABELS[moralLesson] || 'nilai positif';
    const heroName = childName?.trim() || 'Adik';
    const targetLength = length === 'short' ? '5-6 perenggan pendek' : length === 'long' ? '10-12 perenggan' : '7-8 perenggan';

    const prompt = `Anda penulis cerita kanak-kanak terbaik Malaysia.

Tugas: Tulis SATU cerita pendek menarik & mendidik untuk ${ageLabel}.

Maklumat:
- Watak utama: ${heroName}
- Tema: ${theme}
- Pengajaran moral: ${moralLabel}
- Panjang: ${targetLength}

Arahan:
- Bahasa Melayu mudah sesuai umur. Ayat pendek.
- Jalan cerita: permulaan, konflik, penyelesaian.
- Sertakan dialog watak.
- Pengajaran moral jelas tapi tidak khutbah.
- 2-4 emoji sesuai tema.`;

    let storyData: any;
    try {
      storyData = await invokeLLM({
        prompt, model: 'gpt_5_4',
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' }, emoji: { type: 'string' },
            story: { type: 'string' }, moralSummary: { type: 'string' },
          },
          required: ['title', 'story', 'moralSummary'],
        },
      });
      if (!storyData?.title || !storyData?.story) throw new Error('Cerita tidak lengkap');
    } catch (llmErr) {
      await refundCredits(user.email, COST, 'story_generator', 'Refund — Penjana cerita gagal');
      return jsonResponse({ error: 'Gagal menjana cerita. Kredit dikembalikan.', detail: (llmErr as Error).message }, 500);
    }

    // Cover image
    let coverImage = '';
    try {
      const heroDesc = childName?.trim() ? `a cheerful Malaysian child named ${childName.trim()}` : `a cheerful Malaysian child`;
      const imgPrompt = `${heroDesc}, story theme: "${theme}". Style: 3D Pixar-style render, soft cinematic lighting, vibrant colors, friendly cartoon, kid-friendly, no text.`;
      const imgRes = await generateImage(imgPrompt);
      coverImage = imgRes?.url || '';
    } catch (e) { console.error('cover image:', (e as Error).message); }

    // Save to library
    let savedId: string | null = null;
    try {
      const { data: saved } = await supabaseAdmin.from('ck_ai_stories').insert({
        title: storyData.title, emoji: storyData.emoji || '📖',
        cover_image: coverImage, story: storyData.story,
        moral_summary: storyData.moralSummary || '', theme,
        child_name: childName || '', age_range: ageRange,
        moral_lesson: moralLesson, length,
        created_by: user.email,
      }).select().single();
      savedId = saved?.id || null;
    } catch (e) { console.error('save story:', (e as Error).message); }

    return jsonResponse({
      success: true,
      story: { ...storyData, coverImage, id: savedId },
      newBalance: deduction.newBalance,
      creditsUsed: COST,
    });
  } catch (error) {
    console.error('generateAIStory:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});