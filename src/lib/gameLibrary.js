// Game library dengan 20-30 games per kategori
// Struktur ini support scaling ke 200+ games

export const gameLibrary = {
  prasekolah: {
    bahasa_melayu: [
      {
        title: 'Huruf ABC - Biru',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', emoji: '🍎', word: 'Epal' },
            { letter: 'B', emoji: '🐦', word: 'Burung' },
            { letter: 'C', emoji: '🐱', word: 'Kucing' },
            { letter: 'D', emoji: '🐕', word: 'Anjing' },
            { letter: 'E', emoji: '🐘', word: 'Gajah' },
            { letter: 'F', emoji: '🐟', word: 'Ikan' },
          ],
        },
      },
      {
        title: 'Huruf Vokal A-E',
        type: 'letter_match',
        emoji: '🅰️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', emoji: '🍎', word: 'Epal' },
            { letter: 'E', emoji: '🥚', word: 'Telur' },
            { letter: 'I', emoji: '🍦', word: 'Ais Krim' },
            { letter: 'O', emoji: '🍊', word: 'Oren' },
            { letter: 'U', emoji: '☂️', word: 'Payung' },
          ],
        },
      },
      {
        title: 'Kata Mudah - Haiwan',
        type: 'picture_quiz',
        emoji: '🐾',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🐱', options: ['Kucing', 'Anjing', 'Kelinci'], answer: 0 },
            { image: '🐶', options: ['Kucing', 'Anjing', 'Burung'], answer: 1 },
            { image: '🦁', options: ['Singa', 'Harimau', 'Beruang'], answer: 0 },
            { image: '🐘', options: ['Gajah', 'Kuda', 'Zebra'], answer: 0 },
            { image: '🐧', options: ['Penguin', 'Ayam', 'Itik'], answer: 0 },
            { image: '🦒', options: ['Jerapah', 'Rusa', 'Impala'], answer: 0 },
            { image: '🐻', options: ['Beruang', 'Serigala', 'Singa'], answer: 0 },
            { image: '🦓', options: ['Zebra', 'Kuda', 'Poniku'], answer: 0 },
          ],
        },
      },
      {
        title: 'Suara Awal - Haiwan',
        type: 'sound_match',
        emoji: '🔊',
        difficulty: 'easy',
        gameData: { soundCategory: 'animals_bm' },
      },
    ],
    english: [
      {
        title: 'ABC Letters - Blue',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', emoji: '🍎', word: 'Apple' },
            { letter: 'B', emoji: '🐦', word: 'Bird' },
            { letter: 'C', emoji: '🐱', word: 'Cat' },
            { letter: 'D', emoji: '🐕', word: 'Dog' },
            { letter: 'E', emoji: '🐘', word: 'Elephant' },
            { letter: 'F', emoji: '🐟', word: 'Fish' },
          ],
        },
      },
      {
        title: 'Vowels A-E',
        type: 'letter_match',
        emoji: '🅰️',
        difficulty: 'easy',
        gameData: {
          questions: [
            { letter: 'A', emoji: '🍎', word: 'Apple' },
            { letter: 'E', emoji: '🥚', word: 'Egg' },
            { letter: 'I', emoji: '🍦', word: 'Ice Cream' },
            { letter: 'O', emoji: '🍊', word: 'Orange' },
            { letter: 'U', emoji: '☂️', word: 'Umbrella' },
          ],
        },
      },
    ],
    mathematics: [
      {
        title: 'Counting 1-8',
        type: 'counting',
        emoji: '🔢',
        difficulty: 'easy',
        gameData: {
          questions: [
            { count: 1, emoji: '🍎', image: '🍎' },
            { count: 2, emoji: '🍎', image: '🍎🍎' },
            { count: 3, emoji: '🍎', image: '🍎🍎🍎' },
            { count: 4, emoji: '🍎', image: '🍎🍎🍎🍎' },
            { count: 5, emoji: '🍎', image: '🍎🍎🍎🍎🍎' },
            { count: 6, emoji: '🍎', image: '🍎🍎🍎🍎🍎🍎' },
            { count: 7, emoji: '🍎', image: '🍎🍎🍎🍎🍎🍎🍎' },
            { count: 8, emoji: '🍎', image: '🍎🍎🍎🍎🍎🍎🍎🍎' },
          ],
        },
      },
      {
        title: 'Numbers 1-10',
        type: 'number_match',
        emoji: '1️⃣',
        difficulty: 'easy',
        gameData: {
          questions: Array.from({ length: 10 }, (_, i) => ({ number: i + 1, emoji: '⭐' })),
        },
      },
      {
        title: 'Addition 1+1 to 5+5',
        type: 'math_puzzle',
        emoji: '➕',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '1+1', answer: 2, options: [2, 3, 4, 1] },
            { problem: '2+1', answer: 3, options: [2, 3, 4, 1] },
            { problem: '1+2', answer: 3, options: [2, 3, 4, 1] },
            { problem: '2+2', answer: 4, options: [3, 4, 5, 2] },
            { problem: '3+1', answer: 4, options: [3, 4, 5, 2] },
            { problem: '2+3', answer: 5, options: [4, 5, 6, 3] },
            { problem: '4+1', answer: 5, options: [4, 5, 6, 3] },
            { problem: '3+2', answer: 5, options: [4, 5, 6, 3] },
          ],
        },
      },
    ],
    science: [
      {
        title: 'Animals & Habitats',
        type: 'picture_quiz',
        emoji: '🦁',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🐠', options: ['Air', 'Udara', 'Tanah'], answer: 0 },
            { image: '🐦', options: ['Air', 'Udara', 'Tanah'], answer: 1 },
            { image: '🐿️', options: ['Air', 'Udara', 'Tanah'], answer: 2 },
            { image: '🦈', options: ['Air', 'Udara', 'Tanah'], answer: 0 },
            { image: '🦅', options: ['Air', 'Udara', 'Tanah'], answer: 1 },
            { image: '🐜', options: ['Air', 'Udara', 'Tanah'], answer: 2 },
            { image: '🐢', options: ['Air', 'Udara', 'Tanah'], answer: 0 },
            { image: '🦆', options: ['Air', 'Udara', 'Tanah'], answer: 1 },
          ],
        },
      },
      {
        title: 'Warna di Alam (Colors in Nature)',
        type: 'color_match',
        emoji: '🌈',
        difficulty: 'easy',
        gameData: { colors: ['red', 'blue', 'green', 'yellow', 'orange'] },
      },
    ],
  },

  sekolah_rendah: {
    bahasa_melayu: [
      {
        title: 'Huruf Konsonan G-Z',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'G', emoji: '🍇', word: 'Anggur' },
            { letter: 'H', emoji: '🏠', word: 'Rumah' },
            { letter: 'I', emoji: '🍦', word: 'Ais Krim' },
            { letter: 'J', emoji: '🤹', word: 'Jongkong' },
          ],
        },
      },
      {
        title: 'Ayat Mudah - Terbaca',
        type: 'reading',
        emoji: '📖',
        difficulty: 'medium',
        gameData: {
          sentences: ['Saya suka bermain.', 'Kucing itu comel.', 'Mak memasak nasi.'],
        },
      },
      {
        title: 'Kosa Kata Harian',
        type: 'word_builder',
        emoji: '🔠',
        difficulty: 'medium',
        gameData: {
          words: ['rumah', 'sekolah', 'keluarga', 'makanan', 'mainan'],
        },
      },
    ],
    english: [
      {
        title: 'Consonants G-Z',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'G', emoji: '🍇', word: 'Grapes' },
            { letter: 'H', emoji: '🏠', word: 'House' },
            { letter: 'I', emoji: '🍦', word: 'Ice Cream' },
            { letter: 'J', emoji: '🤹', word: 'Juggler' },
          ],
        },
      },
      {
        title: 'Simple Sentences - Reading',
        type: 'reading',
        emoji: '📖',
        difficulty: 'medium',
        gameData: {
          sentences: ['I like to play.', 'The cat is cute.', 'Mom cooks rice.'],
        },
      },
      {
        title: 'Daily Vocabulary',
        type: 'word_builder',
        emoji: '🔠',
        difficulty: 'medium',
        gameData: {
          words: ['house', 'school', 'family', 'food', 'toy'],
        },
      },
    ],
    mathematics: [
      {
        title: 'Addition 1-20',
        type: 'math_puzzle',
        emoji: '➕',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '5+3', answer: 8, options: [7, 8, 9, 6] },
            { problem: '7+4', answer: 11, options: [10, 11, 12, 9] },
            { problem: '10+5', answer: 15, options: [14, 15, 16, 13] },
            { problem: '6+7', answer: 13, options: [12, 13, 14, 11] },
            { problem: '8+5', answer: 13, options: [12, 13, 14, 11] },
            { problem: '9+6', answer: 15, options: [14, 15, 16, 13] },
            { problem: '7+8', answer: 15, options: [14, 15, 16, 13] },
            { problem: '11+4', answer: 15, options: [14, 15, 16, 13] },
          ],
        },
      },
      {
        title: 'Subtraction 1-20',
        type: 'math_puzzle',
        emoji: '➖',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '10-3', answer: 7, options: [6, 7, 8, 5] },
            { problem: '15-5', answer: 10, options: [9, 10, 11, 8] },
            { problem: '20-8', answer: 12, options: [11, 12, 13, 10] },
            { problem: '18-7', answer: 11, options: [10, 11, 12, 9] },
            { problem: '16-4', answer: 12, options: [11, 12, 13, 10] },
            { problem: '14-6', answer: 8, options: [7, 8, 9, 6] },
            { problem: '19-9', answer: 10, options: [9, 10, 11, 8] },
            { problem: '17-5', answer: 12, options: [11, 12, 13, 10] },
          ],
        },
      },
      {
        title: 'Shapes & Angles',
        type: 'shape_sort',
        emoji: '📐',
        difficulty: 'medium',
        gameData: {
          shapes: ['circle', 'square', 'triangle', 'rectangle', 'pentagon'],
        },
      },
    ],
    science: [
      {
        title: 'Human Body Parts',
        type: 'picture_quiz',
        emoji: '🧠',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '👁️', options: ['Mata', 'Hidung', 'Telinga'], answer: 0 },
            { image: '👃', options: ['Mata', 'Hidung', 'Telinga'], answer: 1 },
            { image: '👂', options: ['Mata', 'Hidung', 'Telinga'], answer: 2 },
            { image: '👅', options: ['Lidah', 'Gigi', 'Bibir'], answer: 0 },
            { image: '🦷', options: ['Lidah', 'Gigi', 'Bibir'], answer: 1 },
            { image: '👄', options: ['Lidah', 'Gigi', 'Bibir'], answer: 2 },
            { image: '🧠', options: ['Otak', 'Jantung', 'Paru'], answer: 0 },
            { image: '❤️', options: ['Otak', 'Jantung', 'Paru'], answer: 1 },
          ],
        },
      },
      {
        title: 'Weather & Seasons',
        type: 'picture_quiz',
        emoji: '☀️',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '☀️', options: ['Panas', 'Sejuk', 'Hujan'], answer: 0 },
            { image: '❄️', options: ['Panas', 'Sejuk', 'Hujan'], answer: 1 },
            { image: '🌧️', options: ['Panas', 'Sejuk', 'Hujan'], answer: 2 },
            { image: '⛅', options: ['Awan', 'Panas', 'Gelap'], answer: 0 },
            { image: '🌩️', options: ['Ribut', 'Tenang', 'Tenang'], answer: 0 },
            { image: '🌈', options: ['Pelangi', 'Matahari', 'Hujan'], answer: 0 },
            { image: '❄️☀️', options: ['Sejuk-Panas', 'Hujan', 'Gelap'], answer: 0 },
            { image: '💨', options: ['Angin', 'Hujan', 'Panas'], answer: 0 },
          ],
        },
      },
    ],
  },
};

// Utility functions
export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateStars(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

export function saveScore(gameType, score, total, stars) {
  const scores = JSON.parse(localStorage.getItem('kidScores') || '[]');
  scores.push({
    gameType,
    score,
    total,
    stars,
    date: new Date().toISOString(),
  });
  if (scores.length > 50) scores.splice(0, scores.length - 50);
  localStorage.setItem('kidScores', JSON.stringify(scores));
}

export function getScores() {
  return JSON.parse(localStorage.getItem('kidScores') || '[]');
}

export function clearScores() {
  localStorage.setItem('kidScores', '[]');
}

// Helper functions untuk mendapatkan games
export function getGamesByAgeAndCategory(ageGroup, category) {
  return gameLibrary[ageGroup]?.[category] || [];
}

export function getGamesByAge(ageGroup) {
  return gameLibrary[ageGroup] || {};
}

export function getAllGamesForAge(ageGroup) {
  const games = gameLibrary[ageGroup];
  if (!games) return [];
  return Object.values(games).flat();
}