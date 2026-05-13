import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECT_CONFIGS = [
  { ageGroup: 'prasekolah', subject: 'bahasa_melayu', label: 'Prasekolah - BM' },
  { ageGroup: 'prasekolah', subject: 'english', label: 'Prasekolah - English' },
  { ageGroup: 'prasekolah', subject: 'mathematics', label: 'Prasekolah - Math' },
  { ageGroup: 'prasekolah', subject: 'science', label: 'Prasekolah - Science' },
  { ageGroup: 'prasekolah', subject: 'bahasa_tamil', label: 'Prasekolah - Tamil' },
  { ageGroup: 'prasekolah', subject: 'bahasa_mandarin', label: 'Prasekolah - Mandarin' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', label: 'SR - BM' },
  { ageGroup: 'sekolah_rendah', subject: 'jawi', label: 'SR - Jawi' },
  { ageGroup: 'sekolah_rendah', subject: 'english', label: 'SR - English' },
  { ageGroup: 'sekolah_rendah', subject: 'mathematics', label: 'SR - Math' },
  { ageGroup: 'sekolah_rendah', subject: 'science', label: 'SR - Science' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_tamil', label: 'SR - Tamil' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_mandarin', label: 'SR - Mandarin' },
];

const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
const DARJAH_LABELS = { darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3', darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6' };

const MINI_GAMES = [
  { id: 'abc_phonics', title: 'ABC & Phonics', objective: 'Kenal huruf, bunyi dan bentuk huruf.', emoji: '🔤', modes: ['balloon_pop', 'tracing', 'dragdrop'] },
  { id: 'math_counting', title: 'Math & Counting', objective: 'Nombor, kiraan dan pola asas.', emoji: '🔢', modes: ['falling_catch', 'stacking', 'sequence'] },
  { id: 'bahasa_melayu', title: 'Bahasa Melayu', objective: 'Suku kata, perkataan dan ayat mudah.', emoji: '📚', modes: ['wordbuilder', 'swipe_select', 'spin_wheel'] },
  { id: 'english_vocabulary', title: 'English Vocabulary', objective: 'Vocabulary harian dan perkataan mudah.', emoji: '🌟', modes: ['picture_hunt', 'typing_challenge', 'tilematch'] },
  { id: 'sains_awal', title: 'Sains Awal', objective: 'Pemerhatian, klasifikasi dan sebab-akibat.', emoji: '🔬', modes: ['sorting', 'mini_simulation', 'true_false'] },
  { id: 'jawi_iqra', title: 'Jawi & Iqra', objective: 'Kenal huruf Jawi dan bacaan asas.', emoji: '🕌', modes: ['memory', 'rhythm_tap', 'connect_dots'] },
  { id: 'memory_logic', title: 'Memory & Logic', objective: 'Ingatan, fokus dan penyelesaian masalah.', emoji: '🧠', modes: ['maze', 'hidden_object', 'reaction_speed'] },
  { id: 'islamic_learning', title: 'Islamic Learning', objective: 'Adab, doa dan nilai Islam.', emoji: '🌙', modes: ['story', 'sequence', 'true_false'] },
];

const STORY_SEEDS = [
  {
    title: 'Ali Tolong Kucing', emoji: '🐱', moral: 'Sayangi haiwan dan bantu dengan cara selamat.',
    scenes: [
      { image: '🏫', text: 'Ali balik dari sekolah dan terdengar bunyi kucing kecil.', choices: [{ text: 'Cari bunyi itu', next: 1, star: true }, { text: 'Terus balik rumah', next: 2 }] },
      { image: '🐱', text: 'Ali nampak anak kucing tersepit di tepi longkang.', choices: [{ text: 'Panggil orang dewasa', next: 3, star: true }, { text: 'Tarik sendiri kuat-kuat', next: 2 }] },
      { image: '😟', text: 'Kucing masih takut. Ali belajar perlu minta bantuan.', choices: [{ text: 'Cari cikgu berdekatan', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { image: '👩‍🏫', text: 'Cikgu datang membawa kotak kecil dan tuala lembut.', choices: [{ text: 'Pegang kotak dengan hati-hati', next: 5, star: true }, { text: 'Buat bunyi kuat', next: 2 }] },
      { image: '📦', text: 'Anak kucing masuk ke dalam kotak dan mula bertenang.', choices: [{ text: 'Bawa ke tempat teduh', next: 6, star: true }, { text: 'Tinggalkan di situ', next: 2 }] },
      { image: '🥰', text: 'Pemilik kucing datang mengucapkan terima kasih kepada Ali.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Sara Jaga Hutan', emoji: '🌳', moral: 'Jaga alam sekitar bermula dengan tindakan kecil.',
    scenes: [
      { image: '🌲', text: 'Sara pergi berkelah dan nampak sampah di tepi pokok.', choices: [{ text: 'Kutip dan buang dalam tong', next: 1, star: true }, { text: 'Biarkan sahaja', next: 2 }] },
      { image: '🧤', text: 'Sara memakai sarung tangan sebelum mengutip sampah.', choices: [{ text: 'Kutip plastik dahulu', next: 3, star: true }, { text: 'Pegang kaca tajam', next: 2 }] },
      { image: '😢', text: 'Hutan jadi kotor dan haiwan sedih.', choices: [{ text: 'Ambil beg sampah', next: 3, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { image: '♻️', text: 'Sara asingkan botol plastik dan kertas untuk dikitar semula.', choices: [{ text: 'Asingkan dengan betul', next: 4, star: true }, { text: 'Campur semua sampah', next: 2 }] },
      { image: '🌱', text: 'Mereka menanam pokok kecil di tepi laluan hutan.', choices: [{ text: 'Siram pokok', next: 5, star: true }, { text: 'Pijak pokok', next: 2 }] },
      { image: '🌈', text: 'Hutan kembali ceria dan semua orang seronok!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Mimi Kongsi Mainan', emoji: '🧸', moral: 'Berkongsi membuatkan semua orang gembira.',
    scenes: [
      { image: '🧸', text: 'Mimi membawa beruang mainan baharu ke tadika.', choices: [{ text: 'Tunjuk kepada kawan', next: 1, star: true }, { text: 'Sorok mainan', next: 2 }] },
      { image: '👧', text: 'Lina ingin memegang beruang itu sebentar.', choices: [{ text: 'Beri giliran', next: 3, star: true }, { text: 'Kata tidak selamanya', next: 2 }] },
      { image: '😔', text: 'Lina sedih kerana tidak dapat bermain bersama.', choices: [{ text: 'Fikir semula', next: 3, star: true }, { text: 'Terus bermain sendiri', next: 0 }] },
      { image: '⏰', text: 'Cikgu cadang semua orang bermain ikut giliran.', choices: [{ text: 'Setuju ikut giliran', next: 4, star: true }, { text: 'Rebut mainan', next: 2 }] },
      { image: '👫', text: 'Kawan-kawan lain juga mahu bermain bersama.', choices: [{ text: 'Buat kumpulan kecil', next: 5, star: true }, { text: 'Halau kawan', next: 2 }] },
      { image: '🥰', text: 'Mimi belajar mainan lebih seronok apabila dikongsi.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
];

function withSlideVisual(story, scene, index) {
  const styles = ['from-sky-200 via-cyan-100 to-emerald-200', 'from-amber-200 via-orange-100 to-pink-200', 'from-lime-200 via-green-100 to-teal-200'];
  return { ...scene, slideVisual: { bg: styles[index % styles.length], main: scene.image || story.emoji, side: ['✨', '🌟', '💫'], caption: scene.text } };
}

async function deleteAll(base44, entityName) {
  let deleted = 0;
  for (let page = 0; page < 20; page++) {
    const records = await base44.asServiceRole.entities[entityName].list('-created_date', 1000);
    if (!records || records.length === 0) break;
    for (const record of records) {
      await base44.asServiceRole.entities[entityName].delete(record.id);
      deleted++;
    }
    if (records.length < 1000) break;
  }
  return deleted;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subjectGamesPerTask = 3, questionsPerGame = 10, miniGamesPerCategory = 4, miniRounds = 4, storyCount = 3 } = await req.json();

    const deletedTasks = await deleteAll(base44, 'GameTask');
    const deletedGames = await deleteAll(base44, 'Game');
    const createdTasks = [];

    for (const config of SUBJECT_CONFIGS) {
      if (config.ageGroup === 'sekolah_rendah') {
        for (const darjah of DARJAH_LEVELS) {
          createdTasks.push(await base44.asServiceRole.entities.GameTask.create({
            taskName: `${config.label} - ${DARJAH_LABELS[darjah]}`,
            ageGroup: config.ageGroup,
            darjah,
            subject: config.subject,
            gamesCount: subjectGamesPerTask,
            questionsPerGame,
            status: 'pending',
          }));
        }
      } else {
        createdTasks.push(await base44.asServiceRole.entities.GameTask.create({
          taskName: config.label,
          ageGroup: config.ageGroup,
          subject: config.subject,
          gamesCount: subjectGamesPerTask,
          questionsPerGame,
          status: 'pending',
        }));
      }
    }

    for (const mini of MINI_GAMES) {
      createdTasks.push(await base44.asServiceRole.entities.GameTask.create({
        taskName: `Mini Game: ${mini.title}`,
        ageGroup: 'prasekolah',
        subject: mini.id,
        gamesCount: miniGamesPerCategory,
        questionsPerGame: miniRounds,
        status: 'pending',
        errorMessage: JSON.stringify({
          sets: miniGamesPerCategory,
          levels: 2,
          itemsPerSet: miniRounds,
          theme: mini.objective,
          categoryTitle: mini.title,
          emoji: mini.emoji,
          modes: mini.modes,
        }),
      }));
    }

    for (let i = 0; i < Math.min(storyCount, STORY_SEEDS.length); i++) {
      const story = STORY_SEEDS[i];
      const scenes = story.scenes.map((scene, index) => withSlideVisual(story, scene, index));
      createdTasks.push(await base44.asServiceRole.entities.GameTask.create({
        taskName: `Story Kid: ${story.title}`,
        ageGroup: 'prasekolah',
        subject: 'storykid',
        gamesCount: scenes.length + 1,
        questionsPerGame: scenes.length,
        status: 'pending',
        errorMessage: JSON.stringify({
          story: { title: story.title, emoji: story.emoji, moral: story.moral },
          scenes,
          order: i,
          cover: '',
          generatedScenes: [],
        }),
      }));
    }

    return Response.json({
      success: true,
      deletedGames,
      deletedTasks,
      queuedTasks: createdTasks.length,
      queuedSubjectTasks: SUBJECT_CONFIGS.filter(c => c.ageGroup === 'prasekolah').length + SUBJECT_CONFIGS.filter(c => c.ageGroup === 'sekolah_rendah').length * DARJAH_LEVELS.length,
      queuedMiniTasks: MINI_GAMES.length,
      queuedStoryTasks: Math.min(storyCount, STORY_SEEDS.length),
      message: 'All games deleted and fresh KSSR generation queue created.',
    });
  } catch (error) {
    console.error('resetAndQueueKSSRContent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});