import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COST_PER_STORY = 5;

const AGE_LABELS = {
  '4-6': 'kanak-kanak Prasekolah (4-6 tahun)',
  '7-9': 'kanak-kanak Sekolah Rendah rendah (7-9 tahun)',
  '10-12': 'kanak-kanak Sekolah Rendah atas (10-12 tahun)',
};

const MORAL_LABELS = {
  kejujuran: 'Kejujuran',
  persahabatan: 'Persahabatan',
  keberanian: 'Keberanian',
  kasih_sayang: 'Kasih sayang keluarga',
  kerajinan: 'Kerajinan & usaha',
  tolong_menolong: 'Tolong-menolong',
  menghormati: 'Menghormati orang lain',
  sabar: 'Kesabaran',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { theme, childName, ageRange, moralLesson, length } = await req.json();
    if (!theme || theme.trim().length < 3) {
      return Response.json({ error: 'Tema cerita terlalu pendek' }, { status: 400 });
    }

    // ─── Check & deduct credits (admin bypass) — refetch to mitigate races ───
    const isAdmin = user.role === 'admin';
    const credits = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });
    let credit = credits[0] || null;
    let newBalance = credit?.balance || 0;

    if (!isAdmin) {
      const fresh = credit ? await base44.asServiceRole.entities.UserCredit.get(credit.id) : null;
      const currentBalance = fresh?.balance || 0;
      if (!fresh || currentBalance < COST_PER_STORY) {
        return Response.json({
          error: 'INSUFFICIENT_CREDITS',
          balance: currentBalance,
          required: COST_PER_STORY,
        }, { status: 402 });
      }
      credit = fresh;
      newBalance = currentBalance - COST_PER_STORY;
      const nowIso = new Date().toISOString();
      await base44.asServiceRole.entities.UserCredit.update(credit.id, {
        balance: newBalance,
        totalUsed: (fresh.totalUsed || 0) + COST_PER_STORY,
        lastUsedAt: nowIso,
      });
    }

    // ─── Build LLM prompt ───
    const ageLabel = AGE_LABELS[ageRange] || AGE_LABELS['7-9'];
    const moralLabel = MORAL_LABELS[moralLesson] || 'nilai positif';
    const heroName = childName?.trim() || 'Adik';
    const targetLength = length === 'short' ? '5-6 perenggan pendek' : length === 'long' ? '10-12 perenggan' : '7-8 perenggan';

    const prompt = `Anda adalah penulis cerita kanak-kanak terbaik di Malaysia.

Tugas: Tulis SATU cerita pendek yang menarik dan mendidik untuk ${ageLabel}.

Maklumat cerita:
- Watak utama: ${heroName}
- Tema: ${theme}
- Pengajaran moral: ${moralLabel}
- Panjang: ${targetLength}

Arahan:
- Gunakan Bahasa Melayu yang mudah dan sesuai dengan umur.
- Ayat pendek, perenggan tidak terlalu panjang.
- Bina jalan cerita yang ada permulaan, konflik, dan penyelesaian.
- Sertakan dialog watak supaya hidup.
- Hujung cerita mesti ada pengajaran moral yang jelas tetapi tidak berbentuk khutbah.
- Gunakan 2-4 emoji sesuai tema (taburkan dalam cerita, bukan di hujung sahaja).

Format jawapan dalam JSON:
{
  "title": "Tajuk cerita yang menarik (5-8 patah perkataan)",
  "emoji": "1 emoji utama untuk cerita",
  "story": "Cerita penuh dalam markdown. Pisahkan setiap perenggan dengan dua baris kosong. Gunakan **bold** untuk nama watak penting pada penampilan pertama.",
  "moralSummary": "1 ayat ringkas tentang pengajaran cerita (tidak lebih 20 patah perkataan)"
}`;

    let storyData;
    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5_4',
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            emoji: { type: 'string' },
            story: { type: 'string' },
            moralSummary: { type: 'string' },
          },
          required: ['title', 'story', 'moralSummary'],
        },
      });
      console.log('LLM response keys:', Object.keys(llmResponse || {}));
      storyData = llmResponse;
      if (!storyData?.title || !storyData?.story) {
        console.error('Incomplete story response:', JSON.stringify(llmResponse).substring(0, 500));
        throw new Error('Cerita tidak lengkap dijana');
      }
    } catch (llmErr) {
      console.error('LLM error:', llmErr.message);
      // Refund on failure (only if charged) — refetch then add back to current balance
      if (!isAdmin && credit) {
        const latest = await base44.asServiceRole.entities.UserCredit.get(credit.id);
        await base44.asServiceRole.entities.UserCredit.update(credit.id, {
          balance: (latest?.balance || 0) + COST_PER_STORY,
          totalUsed: Math.max(0, (latest?.totalUsed || 0) - COST_PER_STORY),
        });
        await base44.asServiceRole.entities.CreditTransaction.create({
          userEmail: user.email,
          type: 'refund',
          amount: COST_PER_STORY,
          balanceAfter: credit.balance,
          feature: 'story_generator',
          description: 'Refund — Penjana cerita gagal',
        });
      }
      return Response.json({ error: 'Gagal menjana cerita. Kredit dikembalikan.', detail: llmErr.message }, { status: 500 });
    }

    // ─── Log transaction (skip for admin) ───
    if (!isAdmin) {
      await base44.asServiceRole.entities.CreditTransaction.create({
        userEmail: user.email,
        type: 'usage',
        amount: -COST_PER_STORY,
        balanceAfter: newBalance,
        feature: 'story_generator',
        description: `Cerita: ${storyData.title}`,
        metadata: { theme, childName, ageRange, moralLesson, length, model: 'gpt_5_4' },
      });
    }

    // ─── Generate Pixar 3D cover image — same style as Story Kid ───
    let coverImage = '';
    try {
      const heroDesc = childName?.trim()
        ? `a cheerful Malaysian child named ${childName.trim()}`
        : `a cheerful Malaysian child`;
      const imagePrompt = `${heroDesc}, story theme: "${theme}". Style: 3D Pixar-style render, soft cinematic lighting, vibrant colors, friendly cartoon, kid-friendly, high quality, depth of field, no text, no words. Show the main character and key elements of the story in a heartwarming scene.`;
      const imageRes = await base44.integrations.Core.GenerateImage({ prompt: imagePrompt });
      coverImage = imageRes?.url || '';
    } catch (imgErr) {
      console.error('Cover image gen failed:', imgErr.message);
    }

    // Auto-save story ke library user — tak block respons kalau gagal
    let savedId = null;
    try {
      const saved = await base44.entities.AIStory.create({
        title: storyData.title,
        emoji: storyData.emoji || '📖',
        coverImage,
        story: storyData.story,
        moralSummary: storyData.moralSummary || '',
        theme,
        childName: childName || '',
        ageRange,
        moralLesson,
        length,
      });
      savedId = saved?.id;
    } catch (saveErr) {
      console.error('Failed to save story to library:', saveErr.message);
    }

    return Response.json({
      success: true,
      story: { ...storyData, coverImage, id: savedId },
      newBalance,
      creditsUsed: COST_PER_STORY,
    });
  } catch (error) {
    console.error('generateAIStory error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});