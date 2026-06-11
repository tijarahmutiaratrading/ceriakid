import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  pendidikan_islam: 'Pendidikan Islam',
  pendidikan_moral: 'Pendidikan Moral',
  sejarah: 'Sejarah',
  rbt: 'Reka Bentuk & Teknologi (RBT)',
  pjk: 'Pendidikan Jasmani & Kesihatan (PJK)',
  seni: 'Pendidikan Seni Visual',
  '3m_membaca': '3M - Membaca',
  '3m_menulis': '3M - Menulis',
  '3m_mengira': '3M - Mengira',
};

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah',
  darjah_1: 'Darjah 1',
  darjah_2: 'Darjah 2',
  darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4',
  darjah_5: 'Darjah 5',
  darjah_6: 'Darjah 6',
};

const SUBJECTS = Object.keys(SUBJECT_LABELS);
const LEVELS = Object.keys(LEVEL_LABELS);

// Sejarah & RBT mula Darjah 4 dalam KSSR — langkau tahap rendah & prasekolah.
const SUBJECT_MIN_LEVEL = { sejarah: 4, rbt: 4 };

const NOTE_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    emoji: { type: 'string' },
    summary: { type: 'string' },
    keyPoints: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string' },
          text: { type: 'string' },
          color: { type: 'string', enum: ['purple', 'pink', 'blue', 'green', 'orange', 'yellow', 'red'] },
        },
        required: ['icon', 'text', 'color'],
      },
    },
    mindMap: {
      type: 'object',
      properties: {
        central: { type: 'string' },
        branches: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              emoji: { type: 'string' },
              color: { type: 'string', enum: ['purple', 'pink', 'blue', 'green', 'orange', 'yellow', 'red'] },
              children: { type: 'array', items: { type: 'string' } },
            },
            required: ['label', 'emoji', 'color', 'children'],
          },
        },
      },
      required: ['central', 'branches'],
    },
    funFact: { type: 'string' },
  },
  required: ['title', 'emoji', 'summary', 'keyPoints', 'mindMap', 'funFact'],
};

const BATCH_SCHEMA = {
  type: 'object',
  properties: { notes: { type: 'array', items: NOTE_ITEM_SCHEMA } },
  required: ['notes'],
};

const levelNum = (level) => Number(String(level).replace('darjah_', '')) || 0;

function bucketAllowed(subject, level) {
  const minLvl = SUBJECT_MIN_LEVEL[subject];
  if (!minLvl) return true;
  if (level === 'prasekolah') return false;
  return levelNum(level) >= minLvl;
}

// Langkah 1: minta AI senaraikan SEMUA topik silibus KSSR rasmi untuk subjek+tahap ini.
async function listSyllabusTopics(base44, subjectLabel, levelLabel) {
  const prompt = `Anda pakar silibus KSSR/DSKP Kementerian Pendidikan Malaysia.

Senaraikan SEMUA topik/tajuk utama dalam SILIBUS KSSR rasmi untuk:
Subjek: ${subjectLabel}
Tahap: ${levelLabel}

PERATURAN:
- Senaraikan topik SEBENAR ikut buku teks & DSKP rasmi KPM untuk tahap ini sahaja.
- Ikut urutan standard silibus.
- Setiap item = satu tajuk topik silibus (bukan sub-poin kecil).
- Jangan reka topik yang bukan dalam silibus tahap ini.
- Bilangan topik ikut SEBENAR silibus (boleh 5, 10, 15 — apa sahaja yang betul).

Pulangkan dalam array "topics" (senarai string tajuk topik).`;
  const schema = { type: 'object', properties: { topics: { type: 'array', items: { type: 'string' } } }, required: ['topics'] };
  const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema, model: 'gemini_3_flash' });
  return Array.isArray(res?.topics) ? res.topics.filter(Boolean) : [];
}

// Langkah 2: jana 1 nota mind-map untuk SATU topik silibus.
async function generateNoteForTopic(base44, subjectLabel, levelLabel, topic) {
  const prompt = `Anda pakar pendidikan KSSR Malaysia. Bina SATU NOTA RUJUKAN MENGAJAR (mind map + visual) untuk CIKGU guna semasa mengajar murid.

Subjek: ${subjectLabel}
Tahap: ${levelLabel}
Topik silibus: "${topic}"

FOKUS UTAMA: MIND MAP yang jelas + visual menarik supaya cikgu mudah rujuk & terangkan topik ini kepada murid.

KEPERLUAN:
- "title": guna nama topik silibus ini ("${topic}").
- "emoji": satu emoji mewakili topik.
- "summary": satu ayat ringkas untuk cikgu — apa yang murid akan belajar dalam topik ini.
- "keyPoints": 4-6 isi penting yang cikgu perlu ajar (setiap satu: emoji ikon, teks pendek & padat, warna berbeza dari purple/pink/blue/green/orange/yellow/red).
- "mindMap" (PALING PENTING): "central" = topik ini, "branches" 4-5 cabang mewakili sub-topik utama (setiap cabang: label jelas, emoji, warna berbeza, 3-4 children spesifik untuk pengajaran).
- "funFact": satu fakta menarik untuk tarik minat murid.
- Bahasa mudah & mesra murid, dalam Bahasa Melayu (kecuali subjek English, guna English).`;
  const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: NOTE_ITEM_SCHEMA, model: 'gemini_3_flash' });
  return res;
}

// Proses 1 bucket: jana 1 nota untuk SETIAP topik silibus yang belum ada.
async function seedOneBucket(base44, subject, level) {
  const subjectLabel = SUBJECT_LABELS[subject] || subject;
  const levelLabel = LEVEL_LABELS[level] || level;

  const topics = await listSyllabusTopics(base44, subjectLabel, levelLabel);
  if (topics.length === 0) return { created: 0, noTopics: true };

  const existing = await base44.asServiceRole.entities.StudyNote.filter({ subject, level }, '-created_date', 500).catch(() => []);
  const existingTitles = new Set((existing || []).map((n) => String(n.title || '').trim().toLowerCase()));

  const missing = topics.filter((t) => !existingTitles.has(String(t).trim().toLowerCase()));
  if (missing.length === 0) return { created: 0, alreadyFull: true, totalTopics: topics.length };

  // Hadkan 5 nota setiap larian supaya tak timeout — baki diselesaikan larian seterusnya.
  const batch = missing.slice(0, 5);
  const records = [];
  for (const topic of batch) {
    const n = await generateNoteForTopic(base44, subjectLabel, levelLabel, topic).catch(() => null);
    if (!n?.title) continue;
    records.push({
      title: n.title,
      subject,
      level,
      emoji: n.emoji || '📘',
      summary: n.summary || '',
      keyPoints: n.keyPoints || [],
      mindMap: n.mindMap || { central: n.title, branches: [] },
      funFact: n.funFact || '',
      tier: 'premium',
      isPublished: true,
    });
  }
  if (records.length > 0) await base44.asServiceRole.entities.StudyNote.bulkCreate(records);
  return { created: records.length, totalTopics: topics.length, remaining: missing.length - records.length };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Benarkan panggilan dari scheduled automation (tiada user). Jika ada user, mesti admin.
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    // Mode 1: bucket khusus diberi.
    if (body.subject && body.level) {
      const r = await seedOneBucket(base44, body.subject, body.level);
      return Response.json({ success: true, ...r, subject: body.subject, level: body.level });
    }

    // Mode 2: auto — utamakan bucket yang LANGSUNG TIADA nota dulu (subjek belum disentuh),
    // supaya semua subjek dapat liputan asas dahulu sebelum disempurnakan.
    // Skip pantas tanpa panggil LLM untuk bucket yang sudah ada nota cukup.
    const MIN_PER_BUCKET = 5;
    for (const subject of SUBJECTS) {
      for (const level of LEVELS) {
        if (!bucketAllowed(subject, level)) continue;
        const count = await base44.asServiceRole.entities.StudyNote
          .filter({ subject, level }, '-created_date', MIN_PER_BUCKET)
          .then((x) => x?.length || 0)
          .catch(() => 0);
        if (count >= MIN_PER_BUCKET) continue; // dah cukup asas — skip tanpa panggil LLM
        const r = await seedOneBucket(base44, subject, level);
        return Response.json({ success: true, ...r, subject, level, mode: 'auto' });
      }
    }

    return Response.json({ success: true, done: true, message: 'Semua topik silibus sudah lengkap.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});