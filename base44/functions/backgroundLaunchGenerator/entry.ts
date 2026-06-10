import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Delay kecil antara setiap query database untuk elak rate limit (429)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const QUERY_DELAY_MS = 400;

// Auto-retry bila kena rate limit (429) — tunggu & cuba lagi, jangan terus fail
const isRateLimit = (e) => {
  const msg = `${e?.message || ''} ${e?.status || ''} ${JSON.stringify(e?.response?.data || '')}`;
  return msg.includes('429') || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many requests');
};

async function withRetry(fn, retries = 2) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= retries || !isRateLimit(e)) throw e;
      const wait = 10000 * (attempt + 1);
      console.log(`⏳ Rate limit — retry ${attempt + 1}/${retries} selepas ${wait / 1000}s`);
      await sleep(wait);
    }
  }
}

// Same bucket structure as launchGetProgress
const BUCKETS = [
  { ageGroup: 'prasekolah', darjah: null, subjects: ['bahasa_melayu','english','mathematics','science','jawi'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_1', subjects: ['bahasa_melayu','english','mathematics','science','jawi','pendidikan_islam','pendidikan_moral','rbt','pjk','seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_2', subjects: ['bahasa_melayu','english','mathematics','science','jawi','pendidikan_islam','pendidikan_moral','rbt','pjk','seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_3', subjects: ['bahasa_melayu','english','mathematics','science','jawi','pendidikan_islam','pendidikan_moral','rbt','pjk','seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_4', subjects: ['bahasa_melayu','english','mathematics','science','jawi','pendidikan_islam','pendidikan_moral','sejarah','rbt','pjk','seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_5', subjects: ['bahasa_melayu','english','mathematics','science','jawi','pendidikan_islam','pendidikan_moral','sejarah','rbt','pjk','seni'] },
  { ageGroup: 'sekolah_rendah', darjah: 'darjah_6', subjects: ['bahasa_melayu','english','mathematics','science','jawi','pendidikan_islam','pendidikan_moral','sejarah','rbt','pjk','seni'] },
];

// KAFA buckets — 7 subjek UPKK JAKIM × 6 darjah. Cap kecil dulu (10 per bucket).
const KAFA_SUBJECTS = ['kafa_quran','kafa_jawi','kafa_akidah','kafa_ibadah','kafa_sirah','kafa_adab','kafa_bahasa_arab'];
const KAFA_BUCKETS = ['darjah_1','darjah_2','darjah_3','darjah_4','darjah_5','darjah_6'].map(d => ({
  ageGroup: 'sekolah_rendah', darjah: d, subjects: KAFA_SUBJECTS,
}));
const KAFA_TARGET_CAP = 10;

// ── Self-contained generation (no cross-function invoke — that returns 403) ──
const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English Language', mathematics: 'Mathematics',
  science: 'Science', jawi: 'Jawi (Arabic-Malay script)', pendidikan_islam: 'Pendidikan Islam',
  pendidikan_moral: 'Pendidikan Moral', sejarah: 'Sejarah (History)', rbt: 'Reka Bentuk dan Teknologi',
  pjk: 'Pendidikan Jasmani dan Kesihatan', seni: 'Pendidikan Seni Visual',
  kafa_quran: 'KAFA Al-Quran', kafa_jawi: 'KAFA Jawi', kafa_akidah: 'KAFA Akidah',
  kafa_ibadah: 'KAFA Ibadah', kafa_sirah: 'KAFA Sirah', kafa_adab: 'KAFA Adab Islamiah',
  kafa_bahasa_arab: 'KAFA Bahasa Arab',
};
const AGE_BAND = {
  prasekolah: 'preschool children aged 4-6 (very simple language)',
  darjah_1: 'Year 1 (age 7, KSSR)', darjah_2: 'Year 2 (age 8, KSSR)', darjah_3: 'Year 3 (age 9, KSSR)',
  darjah_4: 'Year 4 (age 10, KSSR)', darjah_5: 'Year 5 (age 11, KSSR)', darjah_6: 'Year 6 (age 12, KSSR/UPSR)',
};
const LANG_RULE = (cat) => {
  if (cat === 'english') return 'Write everything in ENGLISH only.';
  if (cat === 'kafa_bahasa_arab') return 'Write questions in BAHASA MELAYU with Arabic words/script where relevant.';
  if (cat === 'jawi' || cat === 'kafa_jawi' || cat === 'kafa_quran') return 'Write questions in BAHASA MELAYU. Include Jawi/Arabic script where relevant.';
  return 'Write everything in BAHASA MELAYU only. No English mixing.';
};

async function generateAndInsert(base44, { ageGroup, darjah, category, gameIndex, existingTitles }) {
  const level = darjah || ageGroup;
  const prompt = `You are an expert Malaysian KSSR/Prasekolah/KAFA curriculum designer creating a 10-question multiple-choice quiz game.

Subject: ${SUBJECT_LABELS[category] || category}
Level: ${AGE_BAND[level] || level}
LANGUAGE RULE: ${LANG_RULE(category)}

Pick ONE specific syllabus topic for this subject & level that is NOT already covered by these existing game titles: ${JSON.stringify(existingTitles).slice(0, 800)}.

RULES:
1. EXACTLY 10 questions on that one topic. 2. EXACTLY 4 options each. 3. "answer" = index 0-3 of correct option (randomize). 4. Facts 100% accurate to Malaysian syllabus. 5. Plausible distractors. 6. Match the level difficulty. 7. No language mixing. 8. Include an emoji per question. 9. No duplicate questions.

Return ONLY JSON: {"title":"...","emoji":"...","description":"...","questions":[{"problem":"...","options":["..","..","..",".."],"answer":0,"emoji":"🎯"}]}`;

  const isKafa = category.startsWith('kafa_');
  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: isKafa ? 'gpt_5_5' : 'claude_opus_4_7',
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' }, emoji: { type: 'string' }, description: { type: 'string' },
        questions: { type: 'array', items: { type: 'object', properties: {
          problem: { type: 'string' }, options: { type: 'array', items: { type: 'string' } },
          answer: { type: 'number' }, emoji: { type: 'string' },
        }, required: ['problem', 'options', 'answer'] } },
      },
      required: ['title', 'questions'],
    },
  });

  let g = result;
  if (result?.response && typeof result.response === 'object') g = result.response;
  if (!g?.questions || g.questions.length !== 10) return false;
  for (const q of g.questions) {
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) return false;
  }

  await base44.asServiceRole.entities.Game.create({
    title: g.title,
    description: g.description || g.title,
    type: 'multiple_choice',
    category, ageGroup, darjah: darjah || null,
    difficulty: gameIndex < 10 ? 'easy' : gameIndex < 20 ? 'medium' : 'hard',
    tier: gameIndex < 5 ? 'free' : gameIndex < 15 ? 'premium' : 'pro',
    emoji: g.emoji || '🎮',
    totalQuestions: g.questions.length,
    gameData: { questions: g.questions.map(q => ({
      type: 'multiple_choice', problem: q.problem, options: q.options, answer: q.answer,
      emoji: q.emoji || g.emoji || '🎯',
    })) },
    isPublished: true, status: 'ready', order: gameIndex + 1,
    monthTag: new Date().toISOString().slice(0, 7),
  });
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check if background mode is enabled (stored in QCSetting)
    const settings = await base44.asServiceRole.entities.QCSetting.list();
    const setting = settings[0];
    const enabled = setting?.backgroundLaunchEnabled === true;
    const targetCap = setting?.subjectCap || 30;

    if (!enabled) {
      console.log('Background launch is disabled. Skipping.');
      return Response.json({ success: true, skipped: true, reason: 'disabled' });
    }

    // NOTA: Trim step dibuang — terlalu berat (langgar rate limit). Cap dikawal masa generate.
    const totalTrimmed = 0;

    // STEP 1: Cari bucket pertama yang belum cukup — KAFA dulu (priority, cap kecil).
    // Query satu-satu dengan delay kecil & berhenti SERTA-MERTA bila jumpa (elak 429).
    let targetBucket = null;
    let bucketCap = targetCap;

    for (const b of KAFA_BUCKETS) {
      for (const subject of b.subjects) {
        await sleep(QUERY_DELAY_MS);
        const existing = await withRetry(() => base44.asServiceRole.entities.Game.filter({
          ageGroup: b.ageGroup, darjah: b.darjah, category: subject, isPublished: true,
        }));
        if (existing.length < KAFA_TARGET_CAP) {
          targetBucket = {
            ageGroup: b.ageGroup,
            darjah: b.darjah,
            category: subject,
            count: existing.length,
            needed: KAFA_TARGET_CAP - existing.length,
          };
          bucketCap = KAFA_TARGET_CAP;
          break;
        }
      }
      if (targetBucket) break;
    }

    // STEP 2: Kalau KAFA dah cukup, baru sambung KSSR biasa
    if (!targetBucket) {
      for (const b of BUCKETS) {
        for (const subject of b.subjects) {
          await sleep(QUERY_DELAY_MS);
          const filter = { ageGroup: b.ageGroup, category: subject, isPublished: true };
          if (b.darjah) filter.darjah = b.darjah;
          const existing = await withRetry(() => base44.asServiceRole.entities.Game.filter(filter));
          if (existing.length < targetCap) {
            targetBucket = {
              ageGroup: b.ageGroup,
              darjah: b.darjah,
              category: subject,
              count: existing.length,
              needed: targetCap - existing.length,
            };
            bucketCap = targetCap;
            break;
          }
        }
        if (targetBucket) break;
      }
    }

    if (!targetBucket) {
      console.log('🎉 All KSSR + KAFA buckets complete! Auto-disabling background mode.');
      if (setting?.id) {
        await base44.asServiceRole.entities.QCSetting.update(setting.id, { backgroundLaunchEnabled: false });
      }
      // Notify admin via push — content dah siap sepenuhnya
      try {
        await base44.asServiceRole.functions.invoke('sendPushNotification', {
          title: '🎉 Content Siap!',
          body: 'Semua games KSSR + KAFA dah lengkap dijana. Background generator auto-OFF.',
          url: '/admin-dashboard',
          tag: 'content-complete',
        });
      } catch (e) {
        console.error('Push notify failed (non-critical):', e.message);
      }
      return Response.json({ success: true, allComplete: true });
    }

    console.log(`🚀 Background generating: ${targetBucket.ageGroup}/${targetBucket.darjah || 'pra'}/${targetBucket.category} (${targetBucket.count}/${bucketCap})`);

    // Ambil tajuk sedia ada (untuk elak topik berulang)
    const bucketFilter = { ageGroup: targetBucket.ageGroup, category: targetBucket.category, isPublished: true };
    if (targetBucket.darjah) bucketFilter.darjah = targetBucket.darjah;
    const existingGames = await base44.asServiceRole.entities.Game.filter(bucketFilter);
    const existingTitles = existingGames.map(g => g.title).filter(Boolean);

    // Generate INLINE (no cross-function invoke). Slow & steady — max 3 per run.
    const toGenerate = Math.min(targetBucket.needed, 3);
    let generated = 0;
    let failed = 0;

    for (let i = 0; i < toGenerate; i++) {
      const gameIndex = targetBucket.count + generated;
      try {
        const ok = await withRetry(() => generateAndInsert(base44, {
          ageGroup: targetBucket.ageGroup,
          darjah: targetBucket.darjah,
          category: targetBucket.category,
          gameIndex,
          existingTitles,
        }));
        if (ok) generated++;
        else failed++;
      } catch (e) {
        console.error(`Generate failed:`, e.message);
        failed++;
      }
      await sleep(QUERY_DELAY_MS);
    }

    console.log(`✅ Generated ${generated} games (${failed} failed) for ${targetBucket.category}`);

    return Response.json({
      success: true,
      bucket: targetBucket,
      generated,
      failed,
      trimmed: totalTrimmed,
    });
  } catch (error) {
    console.error('backgroundLaunchGenerator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});