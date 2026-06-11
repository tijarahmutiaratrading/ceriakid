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

async function seedOneBucket(base44, subject, level, perBucket) {
  const subjectLabel = SUBJECT_LABELS[subject] || subject;
  const levelLabel = LEVEL_LABELS[level] || level;

  const existing = await base44.asServiceRole.entities.StudyNote.filter({ subject, level }, '-created_date', 200).catch(() => []);
  const existingTitles = (existing || []).map((n) => n.title).filter(Boolean);
  const need = Math.max(0, perBucket - existingTitles.length);
  if (need === 0) return { created: 0, alreadyFull: true };

  const avoidLine = existingTitles.length
    ? `JANGAN ulang tajuk-tajuk ini yang sudah wujud: ${existingTitles.join(', ')}.`
    : '';

  const prompt = `Anda pakar pendidikan KSSR Malaysia. Bina ${need} NOTA RUJUKAN MENGAJAR (mind map + visual) untuk CIKGU guna semasa mengajar murid.

Subjek: ${subjectLabel}
Tahap: ${levelLabel}

PENTING: Setiap nota mesti ikut TOPIK SEBENAR dalam SILIBUS KSSR/DSKP rasmi Kementerian Pendidikan Malaysia — topik yang betul-betul diajar cikgu di dalam kelas untuk subjek & tahap ini. Ikut urutan & tajuk topik standard buku teks KSSR.
${avoidLine}

FOKUS UTAMA: MIND MAP yang jelas + visual menarik supaya cikgu mudah rujuk & terangkan kepada murid.

KEPERLUAN setiap nota:
- "title": nama topik tepat ikut silibus KSSR (cth topik sebenar dari buku teks, bukan rekaan).
- "emoji": satu emoji mewakili topik.
- "summary": satu ayat ringkas untuk cikgu — apa yang murid akan belajar.
- "keyPoints": 4-6 isi penting yang cikgu perlu ajar (setiap satu: emoji ikon, teks pendek & padat, warna berbeza-beza dari purple/pink/blue/green/orange/yellow/red).
- "mindMap" (PALING PENTING): "central" topik tengah, "branches" 4-5 cabang lengkap mewakili sub-topik utama silibus (setiap cabang: label jelas, emoji, warna berbeza, 3-4 children spesifik & berguna untuk pengajaran).
- "funFact": satu fakta menarik untuk tarik minat murid.
- Bahasa mudah & mesra murid, dalam Bahasa Melayu (kecuali subjek English, guna English).

Pulangkan ${need} nota dalam array "notes".`;

  const result = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: BATCH_SCHEMA, model: 'gemini_3_flash' });
  const notes = Array.isArray(result?.notes) ? result.notes : [];
  const records = notes.map((n) => ({
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
  }));
  if (records.length > 0) await base44.asServiceRole.entities.StudyNote.bulkCreate(records);
  return { created: records.length };
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
    const perBucket = Math.min(Math.max(Number(body.perBucket) || 5, 1), 10);

    // Mode 1: bucket khusus diberi.
    if (body.subject && body.level) {
      const r = await seedOneBucket(base44, body.subject, body.level, perBucket);
      return Response.json({ success: true, ...r, subject: body.subject, level: body.level });
    }

    // Mode 2: auto — cari bucket pertama yang belum penuh, proses 1 (untuk automation).
    for (const subject of SUBJECTS) {
      for (const level of LEVELS) {
        if (!bucketAllowed(subject, level)) continue;
        const existing = await base44.asServiceRole.entities.StudyNote.filter({ subject, level }, '-created_date', 200).catch(() => []);
        if ((existing?.length || 0) >= perBucket) continue;
        const r = await seedOneBucket(base44, subject, level, perBucket);
        return Response.json({ success: true, ...r, subject, level, mode: 'auto' });
      }
    }

    return Response.json({ success: true, done: true, message: 'Semua bucket sudah penuh.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});