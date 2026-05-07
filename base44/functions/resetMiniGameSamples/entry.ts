import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MINI_SUBJECTS = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];

const SAMPLE_GAMES = [
  {
    title: 'Ingat Pasangan Wang Pasar', category: 'memory', type: 'memory_game', emoji: '🧠', order: 0,
    gameData: {
      mode: 'memory', playStyle: 'padan pasangan nilai-barang', instruction: 'Padankan nilai wang dengan barang pasar yang sesuai.',
      pairs: [['RM1', 'Sebiji kuih'], ['RM2', 'Sebatang pensel'], ['RM5', 'Sebuah buku nota'], ['RM10', 'Satu set alat tulis']]
    }
  },
  {
    title: 'Seret Haiwan ke Rumahnya', category: 'dragdrop', type: 'drag_drop', emoji: '🎯', order: 0,
    gameData: {
      mode: 'dragdrop', playStyle: 'padan objek ke tempat', instruction: 'Seret setiap haiwan ke tempat tinggal yang betul.',
      items: ['Ikan', 'Burung', 'Kucing', 'Kambing'], targets: ['Air', 'Sarang', 'Rumah', 'Kandang']
    }
  },
  {
    title: 'Bina Perkataan KVKV', category: 'wordbuilder', type: 'word_builder', emoji: '📝', order: 0,
    gameData: {
      mode: 'wordbuilder', playStyle: 'bina perkataan daripada suku kata', instruction: 'Gabungkan suku kata untuk membina perkataan mudah.',
      words: ['buku', 'meja', 'bola', 'kuda'], letters: ['bu', 'ku', 'me', 'ja', 'bo', 'la', 'ku', 'da']
    }
  },
  {
    title: 'Isih Benda Hidup & Bukan Hidup', category: 'sorting', type: 'sorting', emoji: '🗂️', order: 0,
    gameData: {
      mode: 'sorting', playStyle: 'kumpul ikut kategori', instruction: 'Susun item ke kumpulan yang betul.',
      groups: ['Benda Hidup', 'Benda Bukan Hidup'],
      items: [{ text: 'Kucing', group: 'Benda Hidup' }, { text: 'Pokok', group: 'Benda Hidup' }, { text: 'Buku', group: 'Benda Bukan Hidup' }, { text: 'Meja', group: 'Benda Bukan Hidup' }]
    }
  },
  {
    title: 'Padankan Haiwan dan Aksi', category: 'tilematch', type: 'tile_match', emoji: '🔢', order: 0,
    gameData: {
      mode: 'tilematch', playStyle: 'padan soalan-jawapan', instruction: 'Padankan haiwan dengan aksi yang betul.',
      tiles: ['Cat', 'meows', 'Bird', 'flies', 'Fish', 'swims', 'Rabbit', 'jumps']
    }
  },
  {
    title: 'Cerita Pilih Sikap Baik', category: 'story', type: 'story_adventure', emoji: '📖', order: 0,
    gameData: {
      mode: 'story', playStyle: 'pilih tindakan terbaik', instruction: 'Pilih tindakan yang baik untuk membantu kawan.',
      scenes: [
        { text: 'Aiman nampak Sara tiada pensel.', choices: ['Pinjamkan pensel', 'Ketawakan Sara'], answer: 0 },
        { text: 'Sara jatuhkan buku di lantai.', choices: ['Tolong kutip buku', 'Biarkan sahaja'], answer: 0 },
        { text: 'Kawan baru duduk seorang diri.', choices: ['Ajak bermain', 'Jauhkan diri'], answer: 0 },
        { text: 'Giliran beratur di kantin.', choices: ['Beratur dengan sabar', 'Potong barisan'], answer: 0 }
      ]
    }
  },
  {
    title: 'Ramalan Magnet dan Cahaya', category: 'physics', type: 'physics', emoji: '🚀', order: 0,
    gameData: {
      mode: 'physics', playStyle: 'ramal apa berlaku', instruction: 'Pilih jawapan yang paling tepat untuk situasi sains mudah.',
      challenges: [
        { question: 'Magnet didekatkan pada klip kertas. Apa berlaku?', options: ['Klip tertarik', 'Klip cair', 'Klip hilang', 'Klip membesar'], answer: 0 },
        { question: 'Lampu suluh disuluh pada cermin. Apa berlaku?', options: ['Cahaya dipantulkan', 'Cermin pecah', 'Cahaya hilang', 'Cermin jadi panas'], answer: 0 },
        { question: 'Bola ditolak perlahan. Apa berlaku?', options: ['Bola bergerak perlahan', 'Bola terbang tinggi', 'Bola hilang', 'Bola jadi berat'], answer: 0 },
        { question: 'Objek berat ditolak lemah. Apa berlaku?', options: ['Sukar bergerak', 'Bergerak laju', 'Terapung', 'Berbunyi kuat'], answer: 0 }
      ]
    }
  },
  {
    title: 'Surih Huruf Besar A-D', category: 'tracing', type: 'tracing', emoji: '✏️', order: 0,
    gameData: {
      mode: 'tracing', playStyle: 'surih huruf besar', instruction: 'Surih huruf besar dengan kemas.', letters: ['A', 'B', 'C', 'D']
    }
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const games = await base44.asServiceRole.entities.Game.list();
    const miniGames = games.filter(game => MINI_SUBJECTS.includes(game.category));
    for (const game of miniGames) await base44.asServiceRole.entities.Game.delete(game.id);

    const tasks = await base44.asServiceRole.entities.GameTask.list();
    const miniTasks = tasks.filter(task => MINI_SUBJECTS.includes(task.subject));
    for (const task of miniTasks) await base44.asServiceRole.entities.GameTask.delete(task.id);

    const created = [];
    for (const sample of SAMPLE_GAMES) {
      const game = await base44.asServiceRole.entities.Game.create({
        ...sample,
        ageGroup: 'sekolah_rendah',
        difficulty: 'easy',
        tier: 'free',
        totalQuestions: 4,
        isPublished: true,
        status: 'ready',
      });
      created.push({ id: game.id, title: game.title, category: game.category });
    }

    return Response.json({ success: true, deleted: { miniGames: miniGames.length, miniTasks: miniTasks.length }, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});