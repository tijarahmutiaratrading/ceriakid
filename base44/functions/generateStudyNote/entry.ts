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

const NOTE_SCHEMA = {
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subject, level, topic } = await req.json();

    if (!subject || !level) {
      return Response.json({ error: 'subject dan level diperlukan' }, { status: 400 });
    }

    const subjectLabel = SUBJECT_LABELS[subject] || subject;
    const levelLabel = LEVEL_LABELS[level] || level;

    const topicLine = topic
      ? `Topik khusus yang diminta: "${topic}". Bina nota berdasarkan topik ini.`
      : `Pilih SATU topik penting dalam silibus KSSR untuk subjek dan tahap ini yang sesuai dan bermanfaat untuk pelajar.`;

    const prompt = `Anda pakar pendidikan KSSR Malaysia. Bina satu NOTA RINGKAS + MIND MAP untuk kanak-kanak.

Subjek: ${subjectLabel}
Tahap: ${levelLabel}
${topicLine}

KEPERLUAN:
- Mesti tepat dengan SILIBUS KSSR rasmi Kementerian Pendidikan Malaysia untuk tahap ini.
- Bahasa mudah, mesra kanak-kanak, dalam Bahasa Melayu (kecuali subjek English, guna English).
- "title": tajuk topik yang ringkas dan menarik.
- "emoji": satu emoji mewakili topik.
- "summary": satu ayat ringkas terangkan topik.
- "keyPoints": 4 hingga 6 poin ringkas. Setiap poin ada emoji ikon, teks pendek (maks 12 patah perkataan), dan warna (purple/pink/blue/green/orange/yellow/red) — guna warna berbeza-beza supaya warna-warni.
- "mindMap": "central" = topik tengah. "branches" = 3 hingga 4 cabang utama. Setiap cabang ada label, emoji, warna berbeza, dan 2-4 sub-poin (children) yang ringkas.
- "funFact": satu fakta menarik untuk tarik minat budak.

Pastikan kandungan padat, mudah faham, dan sesuai untuk paparan visual berwarna-warni.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: NOTE_SCHEMA,
    });

    const note = await base44.asServiceRole.entities.StudyNote.create({
      title: result.title,
      subject,
      level,
      emoji: result.emoji || '📘',
      summary: result.summary || '',
      keyPoints: result.keyPoints || [],
      mindMap: result.mindMap || { central: result.title, branches: [] },
      funFact: result.funFact || '',
      tier: 'premium',
      isPublished: true,
    });

    return Response.json({ success: true, note });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});