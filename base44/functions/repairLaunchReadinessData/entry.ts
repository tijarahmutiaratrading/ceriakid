import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MINI_GAMES = [
  {
    title: 'Permainan Ingatan Asas', category: 'memory', type: 'memory_game', emoji: '🧠', order: 1,
    gameData: { pairs: [['A', 'Apple'], ['B', 'Ball'], ['C', 'Cat'], ['D', 'Dog']], theme: 'letters' }
  },
  {
    title: 'Padankan Huruf', category: 'dragdrop', type: 'drag_drop', emoji: '🎯', order: 2,
    gameData: { items: ['A', 'B', 'C', 'D'], targets: ['Apple', 'Ball', 'Cat', 'Dog'], instruction: 'Seret huruf ke gambar/perkataan yang betul.' }
  },
  {
    title: 'Bentuk Perkataan Mudah', category: 'wordbuilder', type: 'word_builder', emoji: '📝', order: 3,
    gameData: { words: ['buku', 'bola', 'makan', 'rumah'], letters: ['b','u','k','o','l','a','m','n','r','h'], instruction: 'Susun huruf untuk bina perkataan.' }
  },
  {
    title: 'Isih Kategori', category: 'sorting', type: 'sorting', emoji: '🗂️', order: 4,
    gameData: { groups: ['Nombor', 'Huruf'], items: [{ text: '2', group: 'Nombor' }, { text: 'A', group: 'Huruf' }, { text: '5', group: 'Nombor' }, { text: 'B', group: 'Huruf' }] }
  },
  {
    title: 'Padankan Jubin', category: 'tilematch', type: 'tile_match', emoji: '🔢', order: 5,
    gameData: { tiles: ['🐱', '🐱', '🐶', '🐶', '🍎', '🍎', '⭐', '⭐'], instruction: 'Padankan jubin yang sama.' }
  },
  {
    title: 'Petualangan Cerita', category: 'story', type: 'story_adventure', emoji: '📖', order: 6,
    gameData: { scenes: [{ text: 'Ali jumpa anak kucing di taman.', choices: ['Bantu kucing', 'Tinggalkan'], answer: 0 }, { text: 'Ali beri air kepada kucing.', choices: ['Bagus', 'Tidak baik'], answer: 0 }] }
  },
  {
    title: 'Lontarkan Bola', category: 'physics', type: 'physics', emoji: '🚀', order: 7,
    gameData: { challenges: [{ question: 'Objek jatuh ke bawah kerana apa?', options: ['Graviti', 'Angin', 'Cahaya', 'Bunyi'], answer: 0 }] }
  },
  {
    title: 'Seni Menulis', category: 'tracing', type: 'tracing', emoji: '✏️', order: 8,
    gameData: { letters: ['A', 'B', 'C', '1', '2', '3'], instruction: 'Surih huruf dan nombor dengan kemas.' }
  }
];

const REPAIR_QUESTIONS = {
  'English — Phonics K-O': [
    { problem: 'Which word starts with the letter K?', options: ['Kite', 'Apple', 'Dog', 'Sun'], answer: 0, emoji: '🪁' },
    { problem: 'Which word starts with the letter L?', options: ['Lion', 'Ball', 'Cat', 'Fish'], answer: 0, emoji: '🦁' },
    { problem: 'Which word starts with the letter M?', options: ['Moon', 'Tree', 'Cup', 'Pen'], answer: 0, emoji: '🌙' },
    { problem: 'Which word starts with the letter N?', options: ['Nest', 'Book', 'Car', 'Hat'], answer: 0, emoji: '🪺' },
    { problem: 'Which word starts with the letter O?', options: ['Orange', 'Milk', 'Lamp', 'Shoe'], answer: 0, emoji: '🍊' },
    { problem: 'Pick the word that begins with K.', options: ['Key', 'Fan', 'Boat', 'Egg'], answer: 0, emoji: '🔑' },
    { problem: 'Pick the word that begins with L.', options: ['Leaf', 'Cake', 'Door', 'Ant'], answer: 0, emoji: '🍃' },
    { problem: 'Pick the word that begins with M.', options: ['Milk', 'Sock', 'Road', 'Chair'], answer: 0, emoji: '🥛' },
    { problem: 'Pick the word that begins with N.', options: ['Nose', 'Tree', 'Book', 'Cup'], answer: 0, emoji: '👃' },
    { problem: 'Pick the word that begins with O.', options: ['Owl', 'Fish', 'Bag', 'Star'], answer: 0, emoji: '🦉' }
  ],
  'English — Opposite Words': [
    { problem: 'Choose the opposite of hot.', options: ['Cold', 'Big', 'Fast', 'Tall'], answer: 0, emoji: '❄️' },
    { problem: 'Choose the opposite of big.', options: ['Small', 'Long', 'Happy', 'Wet'], answer: 0, emoji: '🐜' },
    { problem: 'Choose the opposite of up.', options: ['Down', 'Left', 'Open', 'Near'], answer: 0, emoji: '⬇️' },
    { problem: 'Choose the opposite of day.', options: ['Night', 'Morning', 'Sun', 'Light'], answer: 0, emoji: '🌙' },
    { problem: 'Choose the opposite of hard.', options: ['Soft', 'Round', 'Red', 'Slow'], answer: 0, emoji: '🧸' },
    { problem: 'Choose the opposite of open.', options: ['Closed', 'Bright', 'Heavy', 'Quick'], answer: 0, emoji: '🚪' },
    { problem: 'Choose the opposite of happy.', options: ['Sad', 'Short', 'Full', 'Clean'], answer: 0, emoji: '🙂' },
    { problem: 'Choose the opposite of wet.', options: ['Dry', 'Sharp', 'Wide', 'Loud'], answer: 0, emoji: '☀️' },
    { problem: 'Choose the opposite of fast.', options: ['Slow', 'Sweet', 'Deep', 'New'], answer: 0, emoji: '🐢' },
    { problem: 'Choose the opposite of tall.', options: ['Short', 'Warm', 'Thin', 'Kind'], answer: 0, emoji: '📏' }
  ]
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let miniCreated = 0;
    for (const ageGroup of ['prasekolah', 'sekolah_rendah']) {
      for (const mini of MINI_GAMES) {
        const existing = await base44.asServiceRole.entities.Game.filter({ ageGroup, category: mini.category });
        if (!existing || existing.length === 0) {
          await base44.asServiceRole.entities.Game.create({
            ...mini,
            ageGroup,
            difficulty: mini.order <= 2 ? 'easy' : mini.order <= 5 ? 'medium' : 'hard',
            tier: 'free',
            totalQuestions: 1,
            isPublished: true,
            status: 'ready',
            monthTag: '2026-05'
          });
          miniCreated++;
        }
      }
    }

    let repairedGames = 0;
    for (const [title, replacementQuestions] of Object.entries(REPAIR_QUESTIONS)) {
      const matches = await base44.asServiceRole.entities.Game.filter({ title });
      for (const game of matches) {
        await base44.asServiceRole.entities.Game.update(game.id, {
          totalQuestions: replacementQuestions.length,
          gameData: { ...game.gameData, questions: replacementQuestions }
        });
        repairedGames++;
      }
    }

    return Response.json({ success: true, miniCreated, repairedGames });
  } catch (error) {
    console.error('repairLaunchReadinessData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});