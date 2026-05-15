import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi', 'bahasa_tamil', 'bahasa_mandarin'];
const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Aksara Jawi',
  bahasa_tamil: 'Bahasa Tamil',
  bahasa_mandarin: 'Bahasa Mandarin',
};

const DARJAH_LABELS = {
  darjah_1: 'Darjah 1',
  darjah_2: 'Darjah 2',
  darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4',
  darjah_5: 'Darjah 5',
  darjah_6: 'Darjah 6',
};

const KSSR_GUIDE = {
  darjah_1: 'Darjah 1: asas literasi/numerasi. BM/English: huruf, suku kata, perkataan mudah, ayat sangat pendek. Matematik: nombor 0-100, tambah/tolak mudah, bentuk asas. Sains: deria, anggota badan, haiwan/tumbuhan mudah, benda hidup/bukan hidup. Soalan mesti literal dan objek harian.',
  darjah_2: 'Darjah 2: bina ayat mudah dan kefahaman asas. Matematik: nombor hingga 1000, tambah/tolak, darab bahagi asas 2/5/10, wang dan masa mudah. Sains: haiwan, tumbuhan, manusia, kebersihan, bahan harian.',
  darjah_3: 'Darjah 3: kefahaman ringkas dan aplikasi mudah. Matematik: nombor hingga 10000, operasi asas, pecahan mudah, ukuran, wang dan masa. Sains: pengelasan haiwan/tumbuhan, magnet, cahaya, bunyi, sistem suria asas.',
  darjah_4: 'Darjah 4: konsep lebih tersusun. Matematik: nombor besar, operasi bergabung mudah, pecahan/perpuluhan asas, ukuran. Sains: proses hidup, sifat bahan, tenaga, bumi dan alam sekitar asas.',
  darjah_5: 'Darjah 5: aplikasi dan penaakulan sederhana. Matematik: pecahan/perpuluhan/peratus, nisbah mudah, ruang, data. Sains: mikroorganisma, elektrik asas, haba, rantai makanan, teknologi mudah.',
  darjah_6: 'Darjah 6: pengukuhan KSSR tahap 2. Matematik: penyelesaian masalah multi-langkah sederhana, peratus, purata, graf/data. Sains: penyiasatan saintifik, daya, mesin ringkas, ekosistem, bumi/angkasa secara asas.',
};

const MAX_MATH_NUMBER = {
  darjah_1: 100,
  darjah_2: 1000,
  darjah_3: 10000,
  darjah_4: 100000,
  darjah_5: 1000000,
  darjah_6: 10000000,
};

const BANNED_PATTERN = /(hewan|singh|bekam|\blama\b|\bbabi\b|turtle|kodok|kelinci|daki|moo|woof|roar|rindu|semangat ketua|bintang di badannya|rongga hidung|terpanjang di dunia|jangan lupa|dua jenis rupa|haiwan apa|apakah nama haiwan ini|sering dibela|dua telinga panjang dan sangat comel|badan kecil dan suka berlari-lari|boleh terbang di taman|berbulu yang sering dipelihara|soalan\s*\d+|placeholder|contoh jawapan|lihat gambar|gambar di bawah|umum sahaja|aktiviti pembelajaran)/i;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[^a-z0-9\u00C0-\u024F\u0600-\u06FF\u0B80-\u0BFF\u4E00-\u9FFF ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTopic(game) {
  const title = String(game.title || '');
  if (title.includes('—')) return title.split('—').pop().trim();
  if (title.includes('-')) return title.split('-').pop().trim();
  return title.replace(/darjah\s*[1-6]/ig, '').replace(SUBJECT_LABELS[game.category] || '', '').trim() || 'Topik KSSR';
}

function getQuestions(game) {
  return Array.isArray(game.gameData?.questions) ? game.gameData.questions : [];
}

function hasBasicIssue(game, crossSeen) {
  if (!SUBJECTS.includes(game.category)) return false;
  if (game.ageGroup === 'sekolah_rendah' && !DARJAH_LEVELS.includes(game.darjah)) return true;

  const questions = getQuestions(game);
  if (questions.length < Math.max(8, Number(game.totalQuestions || 8))) return true;

  for (const q of questions) {
    const options = Array.isArray(q.options) ? q.options.map(o => String(o || '').trim()) : [];
    const text = normalizeText(q.problem || q.question);
    const joined = [q.problem || q.question, ...options].join(' ');
    if (!text || text.length < 8) return true;
    if (BANNED_PATTERN.test(joined)) return true;
    if (options.length !== 4) return true;
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return true;
    if (new Set(options.map(o => normalizeText(o))).size !== 4) return true;

    if (game.ageGroup === 'sekolah_rendah' && game.darjah) {
      const key = `${game.category}|${text}`;
      const prior = crossSeen.get(key);
      if (prior && prior.darjah !== game.darjah) return true;
      crossSeen.set(key, { darjah: game.darjah, title: game.title });
    }
  }

  if (game.category === 'mathematics' && game.darjah) {
    const allText = normalizeText(`${game.title} ${questions.map(q => `${q.problem} ${(q.options || []).join(' ')}`).join(' ')}`);
    const numbers = (allText.match(/\b\d+\b/g) || []).map(Number).filter(Number.isFinite);
    if (numbers.some(n => n > MAX_MATH_NUMBER[game.darjah])) return true;
  }

  return false;
}

function cleanQuestions(items, count) {
  const seen = new Set();
  return (items || [])
    .map(q => ({
      problem: String(q.problem || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim(),
      options: Array.isArray(q.options) ? q.options.map(o => String(o || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim()).slice(0, 4) : [],
      answer: Math.round(Number(q.answer)),
      emoji: String(q.emoji || '🎓').trim(),
    }))
    .filter(q => q.problem.length >= 8 && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
    .filter(q => !BANNED_PATTERN.test([q.problem, ...q.options].join(' ')))
    .filter(q => new Set(q.options.map(o => normalizeText(o))).size === 4)
    .filter(q => {
      const key = normalizeText(q.problem);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, count);
}

async function regenerateQuestions(base44, game, count, existingTexts) {
  const subjectLabel = SUBJECT_LABELS[game.category] || game.category;
  const darjahLabel = DARJAH_LABELS[game.darjah] || game.darjah || 'Prasekolah';
  const topic = extractTopic(game);
  const kssrGuide = KSSR_GUIDE[game.darjah] || 'Ikut tahap prasekolah sahaja.';
  const languageRule = game.category === 'english'
    ? 'Use English only for all questions, options and answers.'
    : game.category === 'bahasa_tamil'
      ? 'Gunakan Bahasa Tamil sahaja untuk soalan, pilihan dan jawapan.'
      : game.category === 'bahasa_mandarin'
        ? 'Gunakan Bahasa Mandarin/Chinese sahaja untuk soalan, pilihan dan jawapan.'
        : 'Gunakan Bahasa Melayu Malaysia baku yang natural.';

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Anda ialah guru pakar KSSR/DSKP Malaysia. Jana semula TEPAT ${count} soalan untuk game ini supaya 100% sesuai silibus dan Darjah yang betul.

Game: ${game.title}
Subjek: ${subjectLabel}
Tahap tepat: ${darjahLabel}
Topik: ${topic}
Panduan KSSR: ${kssrGuide}

WAJIB:
1. Semua soalan mesti tepat untuk ${darjahLabel} sahaja, bukan tahap lebih rendah/lebih tinggi.
2. Jangan ulang soalan merentas Darjah lain. Elakkan pola/teks ini: ${existingTexts.slice(-40).join(' | ')}
3. Fokus topik "${topic}" tetapi aras soalan ikut ${darjahLabel}.
4. ${languageRule}
5. 4 pilihan jawapan unik, hanya satu betul, answer index 0-3 tepat.
6. Jangan guna trivia rawak, silibus sekolah menengah, fakta pelik, bahasa Indonesia, placeholder, atau soalan perlukan gambar.
7. Untuk Matematik, nombor dan operasi mesti ikut julat KSSR ${darjahLabel}.
8. Untuk Jawi, jangan buat soalan matematik/nombor sahaja; mesti huruf Jawi, ejaan Jawi, Iqra atau adab Islam asas.
9. Problem/options tidak boleh ada emoji; emoji hanya dalam field emoji.
10. JANGAN guna soalan definisi umum berulang seperti "Apakah maksud..." atau "Apa itu..." untuk topik yang sama. Guna situasi khusus ${darjahLabel}, contoh harian, aplikasi, pemerhatian, kiraan atau pilihan tindakan supaya tidak sama dengan Darjah lain.

Output JSON sahaja: questions[{problem, options[4], answer, emoji}]`,
    response_json_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              problem: { type: 'string' },
              options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
              answer: { type: 'number', minimum: 0, maximum: 3 },
              emoji: { type: 'string' },
            },
            required: ['problem', 'options', 'answer', 'emoji'],
          },
        },
      },
      required: ['questions'],
    },
  });

  const cleaned = cleanQuestions(result.questions, count);
  if (cleaned.length < count) {
    const topup = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Jana ${count - cleaned.length} soalan tambahan untuk ${game.title}, ${subjectLabel}, ${darjahLabel}. Jangan ulang: ${cleaned.map(q => q.problem).join(' | ')}. Ikut KSSR tepat: ${kssrGuide}. Output JSON questions sahaja.`,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                problem: { type: 'string' },
                options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
                answer: { type: 'number', minimum: 0, maximum: 3 },
                emoji: { type: 'string' },
              },
              required: ['problem', 'options', 'answer', 'emoji'],
            },
          },
        },
        required: ['questions'],
      },
    });
    return cleanQuestions([...cleaned, ...(topup.questions || [])], count);
  }

  return cleaned;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { limit = 5, dryRun = false } = await req.json().catch(() => ({}));
    const games = await base44.asServiceRole.entities.Game.list('-updated_date', 1000);
    const subjectGames = (games || []).filter(g => SUBJECTS.includes(g.category));
    const crossSeen = new Map();
    const existingTexts = [];
    const targets = [];

    for (const game of subjectGames) {
      const issue = hasBasicIssue(game, crossSeen);
      getQuestions(game).forEach(q => existingTexts.push(q.problem || q.question || ''));
      if (issue) targets.push(game);
    }

    const selected = targets.slice(0, Math.max(1, Math.min(Number(limit) || 5, 8)));
    const repaired = [];
    const skipped = [];

    for (const game of selected) {
      if (game.ageGroup === 'sekolah_rendah' && !DARJAH_LEVELS.includes(game.darjah)) {
        skipped.push({ id: game.id, title: game.title, reason: 'missing_darjah' });
        continue;
      }

      // Re-verify game still exists (race condition with auto-repair / monthly delete)
      let fresh;
      try {
        fresh = await base44.asServiceRole.entities.Game.get?.(game.id);
      } catch {
        fresh = null;
      }
      if (!fresh) {
        const found = await base44.asServiceRole.entities.Game.filter({ id: game.id });
        fresh = found?.[0];
      }
      if (!fresh) {
        skipped.push({ id: game.id, title: game.title, reason: 'already_deleted' });
        continue;
      }

      const count = Math.max(8, Math.min(Number(fresh.totalQuestions || getQuestions(fresh).length || 8), 20));
      const questions = await regenerateQuestions(base44, fresh, count, existingTexts);
      if (questions.length < 8) {
        skipped.push({ id: fresh.id, title: fresh.title, reason: 'not_enough_clean_questions' });
        continue;
      }

      if (!dryRun) {
        try {
          await base44.asServiceRole.entities.Game.update(fresh.id, {
            totalQuestions: questions.length,
            gameData: { ...(fresh.gameData || {}), questions },
            status: 'ready',
            isPublished: true,
          });
        } catch (err) {
          skipped.push({ id: fresh.id, title: fresh.title, reason: `update_failed: ${err.message}` });
          continue;
        }
      }

      repaired.push({ id: fresh.id, title: fresh.title, darjah: fresh.darjah || null, questions: questions.length });
      questions.forEach(q => existingTexts.push(q.problem));
    }

    return Response.json({
      success: true,
      dryRun,
      scanned: subjectGames.length,
      remainingBeforeBatch: targets.length,
      repairedCount: repaired.length,
      skippedCount: skipped.length,
      repaired,
      skipped,
      message: dryRun ? 'Dry run complete' : `Repaired ${repaired.length} KSSR subject games`,
    });
  } catch (error) {
    console.error('repairKSSRSubjectGames error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});