import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VARIATIONS = [
  {
    title: 'Ingat Pasangan Bentuk Sekolah', category: 'memory', type: 'memory_game', emoji: '🧠', order: 1,
    gameData: { mode: 'memory', playStyle: 'padan bentuk-kegunaan', instruction: 'Padankan bentuk dengan objek sekolah yang sepadan.', pairs: [['Segi empat tepat', 'Buku'], ['Bulatan', 'Jam'], ['Segi tiga', 'Pembaris segi tiga'], ['Silinder', 'Botol air']] }
  },
  {
    title: 'Ingat Pasangan Haiwan dan Bunyi', category: 'memory', type: 'memory_game', emoji: '🧠', order: 2,
    gameData: { mode: 'memory', playStyle: 'padan haiwan-bunyi', instruction: 'Padankan haiwan dengan bunyinya.', pairs: [['Kucing', 'Miau'], ['Lembu', 'Moo'], ['Ayam', 'Kokok'], ['Burung', 'Cip cip']] }
  },
  {
    title: 'Seret Makanan ke Kumpulan', category: 'dragdrop', type: 'drag_drop', emoji: '🎯', order: 1,
    gameData: { mode: 'dragdrop', playStyle: 'seret item ke kategori', instruction: 'Seret makanan ke kumpulan rasa yang betul.', items: ['Gula-gula', 'Limau', 'Kerepek', 'Kopi'], targets: ['Manis', 'Masam', 'Masin', 'Pahit'] }
  },
  {
    title: 'Seret Langkah Cuci Tangan', category: 'dragdrop', type: 'drag_drop', emoji: '🎯', order: 2,
    gameData: { mode: 'dragdrop', playStyle: 'susun langkah ikut turutan', instruction: 'Susun langkah mencuci tangan dengan betul.', items: ['Basahkan tangan', 'Letak sabun', 'Gosok tangan', 'Bilas dan lap'], targets: ['Langkah 1', 'Langkah 2', 'Langkah 3', 'Langkah 4'] }
  },
  {
    title: 'Bina Perkataan Haiwan', category: 'wordbuilder', type: 'word_builder', emoji: '📝', order: 1,
    gameData: { mode: 'wordbuilder', playStyle: 'susun suku kata haiwan', instruction: 'Gabungkan suku kata untuk membina nama haiwan.', words: ['rusa', 'ayam', 'ikan', 'katak'], letters: ['ru', 'sa', 'a', 'yam', 'i', 'kan', 'ka', 'tak'] }
  },
  {
    title: 'Lengkapkan Perkataan Sekolah', category: 'wordbuilder', type: 'word_builder', emoji: '📝', order: 2,
    gameData: { mode: 'wordbuilder', playStyle: 'lengkapkan huruf hilang', instruction: 'Susun huruf untuk membentuk perkataan alat sekolah.', words: ['pensil', 'buku', 'beg', 'papan'], letters: ['p', 'e', 'n', 's', 'i', 'l', 'b', 'u', 'k', 'u', 'b', 'e', 'g', 'p', 'a', 'p', 'a', 'n'] }
  },
  {
    title: 'Isih Makanan Sihat dan Tidak Sihat', category: 'sorting', type: 'sorting', emoji: '🗂️', order: 1,
    gameData: { mode: 'sorting', playStyle: 'asingkan contoh', instruction: 'Susun makanan mengikut kategori.', groups: ['Sihat', 'Kurang Sihat'], items: [{ text: 'Epal', group: 'Sihat' }, { text: 'Sayur', group: 'Sihat' }, { text: 'Gula-gula', group: 'Kurang Sihat' }, { text: 'Air bergas', group: 'Kurang Sihat' }] }
  },
  {
    title: 'Isih Kenderaan Darat dan Air', category: 'sorting', type: 'sorting', emoji: '🗂️', order: 2,
    gameData: { mode: 'sorting', playStyle: 'kelaskan mengikut tempat bergerak', instruction: 'Letakkan kenderaan ke tempat bergerak yang betul.', groups: ['Darat', 'Air'], items: [{ text: 'Kereta', group: 'Darat' }, { text: 'Bas', group: 'Darat' }, { text: 'Sampan', group: 'Air' }, { text: 'Kapal', group: 'Air' }] }
  },
  {
    title: 'Padankan Nombor dan Kuantiti', category: 'tilematch', type: 'tile_match', emoji: '🔢', order: 1,
    gameData: { mode: 'tilematch', playStyle: 'padan nombor-kuantiti', instruction: 'Padankan nombor dengan bilangan yang sama.', tiles: ['2', 'dua epal', '3', 'tiga pensel', '4', 'empat buku', '5', 'lima bola'] }
  },
  {
    title: 'Padankan Lawan Kata', category: 'tilematch', type: 'tile_match', emoji: '🔢', order: 2,
    gameData: { mode: 'tilematch', playStyle: 'padan lawan kata', instruction: 'Padankan perkataan dengan lawan katanya.', tiles: ['Besar', 'Kecil', 'Panjang', 'Pendek', 'Tinggi', 'Rendah', 'Cepat', 'Lambat'] }
  },
  {
    title: 'Cerita Jujur di Kantin', category: 'story', type: 'story_adventure', emoji: '📖', order: 1,
    gameData: { mode: 'story', playStyle: 'pilih nilai murni', instruction: 'Pilih tindakan jujur dalam cerita.', scenes: [{ text: 'Mira jumpa duit di kantin.', choices: ['Serah kepada guru', 'Simpan sendiri'], answer: 0 }, { text: 'Kawan tertinggal makanan.', choices: ['Pulangkan', 'Buang'], answer: 0 }, { text: 'Juruwang tersilap baki.', choices: ['Beritahu juruwang', 'Diam sahaja'], answer: 0 }, { text: 'Meja kantin kotor.', choices: ['Tolong bersihkan', 'Tinggalkan'], answer: 0 }] }
  },
  {
    title: 'Cerita Selamat di Taman', category: 'story', type: 'story_adventure', emoji: '📖', order: 2,
    gameData: { mode: 'story', playStyle: 'pilih tindakan selamat', instruction: 'Bantu watak memilih tindakan yang selamat.', scenes: [{ text: 'Dina mahu melintas jalan.', choices: ['Tunggu lampu hijau', 'Lari terus'], answer: 0 }, { text: 'Bola jatuh ke jalan raya.', choices: ['Minta bantuan dewasa', 'Kejar bola'], answer: 0 }, { text: 'Orang tidak dikenali beri gula-gula.', choices: ['Tolak dengan sopan', 'Ikut orang itu'], answer: 0 }, { text: 'Hujan mula turun.', choices: ['Berteduh di tempat selamat', 'Bermain kilat'], answer: 0 }] }
  },
  {
    title: 'Cabaran Tolak dan Tarik', category: 'physics', type: 'physics', emoji: '🚀', order: 1,
    gameData: { mode: 'physics', playStyle: 'pilih sebab saintifik', instruction: 'Jawab soalan tentang daya tolak dan tarik.', challenges: [{ question: 'Pintu dibuka dengan menarik pemegang. Ini contoh apa?', options: ['Tarikan', 'Cahaya', 'Bunyi', 'Haba'], answer: 0 }, { question: 'Menolak troli membuat troli bergerak. Ini contoh apa?', options: ['Tolakan', 'Bau', 'Warna', 'Bayang'], answer: 0 }, { question: 'Daya yang kuat boleh membuat objek bergerak lebih...', options: ['Laju', 'Gelap', 'Sejuk', 'Kecil'], answer: 0 }, { question: 'Objek berhenti bila tiada daya mencukupi dan ada...', options: ['Geseran', 'Pelangi', 'Makanan', 'Bunyi'], answer: 0 }] }
  },
  {
    title: 'Cabaran Tenggelam dan Terapung', category: 'physics', type: 'physics', emoji: '🚀', order: 2,
    gameData: { mode: 'physics', playStyle: 'ramal apa berlaku', instruction: 'Pilih objek yang tenggelam atau terapung.', challenges: [{ question: 'Batu kecil dimasukkan ke dalam air. Apa berlaku?', options: ['Tenggelam', 'Terbang', 'Menyala', 'Berbunyi'], answer: 0 }, { question: 'Daun kering diletak atas air. Apa berlaku?', options: ['Terapung', 'Tenggelam cepat', 'Meletup', 'Menjadi besi'], answer: 0 }, { question: 'Objek ringan biasanya lebih mudah...', options: ['Terapung', 'Mencair', 'Membeku', 'Hilang'], answer: 0 }, { question: 'Objek berat dan padat biasanya...', options: ['Tenggelam', 'Terbang', 'Bercahaya', 'Berbau'], answer: 0 }] }
  },
  {
    title: 'Surih Nombor 1-4', category: 'tracing', type: 'tracing', emoji: '✏️', order: 1,
    gameData: { mode: 'tracing', playStyle: 'surih nombor', instruction: 'Surih nombor dengan kemas.', letters: ['1', '2', '3', '4'] }
  },
  {
    title: 'Surih Bentuk Asas', category: 'tracing', type: 'tracing', emoji: '✏️', order: 2,
    gameData: { mode: 'tracing', playStyle: 'surih bentuk asas', instruction: 'Surih bentuk asas dengan kemas.', letters: ['○', '□', '△', '◇'] }
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.Game.list();
    const created = [];

    for (const item of VARIATIONS) {
      const duplicate = existing.find(game => game.category === item.category && game.title === item.title);
      if (duplicate) continue;

      const game = await base44.asServiceRole.entities.Game.create({
        ...item,
        ageGroup: 'sekolah_rendah',
        difficulty: item.order === 1 ? 'medium' : 'hard',
        tier: 'free',
        totalQuestions: 4,
        isPublished: true,
        status: 'ready',
      });
      created.push({ id: game.id, title: game.title, category: game.category });
    }

    return Response.json({ success: true, createdCount: created.length, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});