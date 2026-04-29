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
            { letter: 'A', emoji: '🍎', word: 'Epal', options: ['A', 'B', 'C', 'D'], answer: 0 },
            { letter: 'B', emoji: '🐦', word: 'Burung', options: ['A', 'B', 'C', 'D'], answer: 1 },
            { letter: 'C', emoji: '🐱', word: 'Kucing', options: ['A', 'B', 'C', 'D'], answer: 2 },
            { letter: 'D', emoji: '🐕', word: 'Anjing', options: ['A', 'B', 'C', 'D'], answer: 3 },
            { letter: 'E', emoji: '🐘', word: 'Gajah', options: ['D', 'E', 'F', 'G'], answer: 1 },
            { letter: 'F', emoji: '🐟', word: 'Ikan', options: ['D', 'E', 'F', 'G'], answer: 2 },
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
            { letter: 'A', emoji: '🍎', word: 'Epal', options: ['A', 'E', 'I', 'O'], answer: 0 },
            { letter: 'E', emoji: '🥚', word: 'Telur', options: ['A', 'E', 'I', 'O'], answer: 1 },
            { letter: 'I', emoji: '🍦', word: 'Ais Krim', options: ['A', 'E', 'I', 'O'], answer: 2 },
            { letter: 'O', emoji: '🍊', word: 'Oren', options: ['A', 'E', 'I', 'O'], answer: 3 },
            { letter: 'U', emoji: '☂️', word: 'Payung', options: ['I', 'U', 'E', 'O'], answer: 1 },
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
        title: 'Suara Haiwan',
        type: 'sound_match',
        emoji: '🔊',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🐱', options: ['Meow', 'Woof', 'Moo', 'Baa'], answer: 0 },
            { image: '🐶', options: ['Meow', 'Woof', 'Moo', 'Baa'], answer: 1 },
            { image: '🐄', options: ['Meow', 'Woof', 'Moo', 'Baa'], answer: 2 },
            { image: '🐑', options: ['Meow', 'Woof', 'Moo', 'Baa'], answer: 3 },
            { image: '🦆', options: ['Quack', 'Hiss', 'Chirp', 'Roar'], answer: 0 },
            { image: '🐍', options: ['Quack', 'Hiss', 'Chirp', 'Roar'], answer: 1 },
            { image: '🐦', options: ['Quack', 'Hiss', 'Chirp', 'Roar'], answer: 2 },
            { image: '🦁', options: ['Quack', 'Hiss', 'Chirp', 'Roar'], answer: 3 },
          ],
        },
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
            { letter: 'A', emoji: '🍎', word: 'Apple', options: ['A', 'B', 'C', 'D'], answer: 0 },
            { letter: 'B', emoji: '🐦', word: 'Bird', options: ['A', 'B', 'C', 'D'], answer: 1 },
            { letter: 'C', emoji: '🐱', word: 'Cat', options: ['A', 'B', 'C', 'D'], answer: 2 },
            { letter: 'D', emoji: '🐕', word: 'Dog', options: ['A', 'B', 'C', 'D'], answer: 3 },
            { letter: 'E', emoji: '🐘', word: 'Elephant', options: ['D', 'E', 'F', 'G'], answer: 1 },
            { letter: 'F', emoji: '🐟', word: 'Fish', options: ['D', 'E', 'F', 'G'], answer: 2 },
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
            { letter: 'A', emoji: '🍎', word: 'Apple', options: ['A', 'E', 'I', 'O'], answer: 0 },
            { letter: 'E', emoji: '🥚', word: 'Egg', options: ['A', 'E', 'I', 'O'], answer: 1 },
            { letter: 'I', emoji: '🍦', word: 'Ice Cream', options: ['A', 'E', 'I', 'O'], answer: 2 },
            { letter: 'O', emoji: '🍊', word: 'Orange', options: ['A', 'E', 'I', 'O'], answer: 3 },
            { letter: 'U', emoji: '☂️', word: 'Umbrella', options: ['I', 'U', 'E', 'O'], answer: 1 },
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
            { image: '🍎', options: ['1', '2', '3', '4'], answer: 0 },
            { image: '🍎🍎', options: ['1', '2', '3', '4'], answer: 1 },
            { image: '🍎🍎🍎', options: ['1', '2', '3', '4'], answer: 2 },
            { image: '🍎🍎🍎🍎', options: ['1', '2', '3', '4'], answer: 3 },
            { image: '🍎🍎🍎🍎🍎', options: ['4', '5', '6', '7'], answer: 1 },
            { image: '🍎🍎🍎🍎🍎🍎', options: ['4', '5', '6', '7'], answer: 1 },
            { image: '🍎🍎🍎🍎🍎🍎🍎', options: ['5', '6', '7', '8'], answer: 1 },
            { image: '🍎🍎🍎🍎🍎🍎🍎🍎', options: ['6', '7', '8', '9'], answer: 1 },
          ],
        },
      },
      {
        title: 'Numbers 1-10',
        type: 'number_match',
        emoji: '1️⃣',
        difficulty: 'easy',
        gameData: {
          questions: [
            { problem: '⭐', options: ['1', '2', '3'], answer: 0 },
            { problem: '⭐⭐', options: ['1', '2', '3'], answer: 1 },
            { problem: '⭐⭐⭐', options: ['1', '2', '3'], answer: 2 },
            { problem: '⭐⭐⭐⭐', options: ['3', '4', '5'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐', options: ['4', '5', '6'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐', options: ['5', '6', '7'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐⭐', options: ['6', '7', '8'], answer: 1 },
            { problem: '⭐⭐⭐⭐⭐⭐⭐⭐', options: ['7', '8', '9'], answer: 1 },
          ],
        },
      },
      {
        title: 'Addition 1+1 to 5+5',
        type: 'math_puzzle',
        emoji: '➕',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: '1+1', options: ['3', '2', '4', '5'], answer: 1 },
            { problem: '2+1', options: ['4', '3', '5', '6'], answer: 1 },
            { problem: '1+2', options: ['4', '3', '5', '6'], answer: 1 },
            { problem: '2+2', options: ['6', '4', '5', '7'], answer: 1 },
            { problem: '3+1', options: ['6', '4', '5', '7'], answer: 1 },
            { problem: '2+3', options: ['7', '5', '6', '8'], answer: 1 },
            { problem: '4+1', options: ['7', '5', '6', '8'], answer: 1 },
            { problem: '3+2', options: ['7', '5', '6', '8'], answer: 1 },
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
        title: 'Warna-Warni di Alam',
        type: 'color_match',
        emoji: '🌈',
        difficulty: 'easy',
        gameData: {
          questions: [
            { image: '🔴', options: ['Merah', 'Biru', 'Hijau'], answer: 0 },
            { image: '🔵', options: ['Merah', 'Biru', 'Hijau'], answer: 1 },
            { image: '🟢', options: ['Merah', 'Biru', 'Hijau'], answer: 2 },
            { image: '🟡', options: ['Kuning', 'Oren', 'Merah'], answer: 0 },
            { image: '🟠', options: ['Kuning', 'Oren', 'Merah'], answer: 1 },
            { image: '💜', options: ['Ungu', 'Merah Jambu', 'Biru'], answer: 0 },
            { image: '🤎', options: ['Cokelat', 'Hitam', 'Kelabu'], answer: 0 },
            { image: '⚫', options: ['Cokelat', 'Hitam', 'Kelabu'], answer: 1 },
          ],
        },
      },
    ],
  },

  sekolah_rendah: {
    bahasa_melayu: [
      {
        title: 'Huruf G-Z',
        type: 'letter_match',
        emoji: '🔤',
        difficulty: 'medium',
        gameData: {
          questions: [
            { letter: 'G', emoji: '🍇', word: 'Anggur', options: ['G', 'H', 'I', 'J'], answer: 0 },
            { letter: 'H', emoji: '🏠', word: 'Rumah', options: ['G', 'H', 'I', 'J'], answer: 1 },
            { letter: 'I', emoji: '🍦', word: 'Ais Krim', options: ['G', 'H', 'I', 'J'], answer: 2 },
            { letter: 'J', emoji: '🤹', word: 'Jongkong', options: ['G', 'H', 'I', 'J'], answer: 3 },
            { letter: 'K', emoji: '🪁', word: 'Wau', options: ['J', 'K', 'L', 'M'], answer: 1 },
            { letter: 'L', emoji: '🦁', word: 'Singa', options: ['J', 'K', 'L', 'M'], answer: 2 },
            { letter: 'M', emoji: '🌙', word: 'Bulan', options: ['J', 'K', 'L', 'M'], answer: 3 },
            { letter: 'N', emoji: '🌰', word: 'Buah', options: ['M', 'N', 'O', 'P'], answer: 1 },
          ],
        },
      },
      {
        title: 'Ayat Senang - Baca',
        type: 'reading',
        emoji: '📖',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'Saya suka bermain.', options: ['Bermain', 'Tidur', 'Makan'], answer: 0 },
            { problem: 'Kucing itu comel.', options: ['Comel', 'Besar', 'Kecil'], answer: 0 },
            { problem: 'Mak memasak nasi.', options: ['Nasi', 'Roti', 'Mee'], answer: 0 },
            { problem: 'Ayah memperbaiki kereta.', options: ['Kereta', 'Basikal', 'Bas'], answer: 0 },
            { problem: 'Adik bermain bola.', options: ['Bola', 'Wayang', 'Boneka'], answer: 0 },
            { problem: 'Sekolah ditutup hari ini.', options: ['Hari ini', 'Esok', 'Seminggu'], answer: 0 },
            { problem: 'Kami bermain di taman.', options: ['Taman', 'Rumah', 'Sekolah'], answer: 0 },
            { problem: 'Adik minum susu panas.', options: ['Susu', 'Air', 'Jus'], answer: 0 },
          ],
        },
      },
      {
        title: 'Kata-Kata Hari-Hari',
        type: 'word_builder',
        emoji: '🔠',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'r-m-h', options: ['rumah', 'rokok', 'rimau'], answer: 0 },
            { problem: 's-k-l-h', options: ['sekolah', 'sakat', 'sakti'], answer: 0 },
            { problem: 'k-l-r-g-', options: ['keluarga', 'kemarau', 'kelapa'], answer: 0 },
            { problem: 'm-k-n-n', options: ['makanan', 'martabak', 'meriam'], answer: 0 },
            { problem: 'm-i-n-n', options: ['mainan', 'manisan', 'mesin'], answer: 0 },
            { problem: 'k-p-l', options: ['kapel', 'kopel', 'kapali'], answer: 0 },
            { problem: 'b-k-', options: ['buku', 'bake', 'boke'], answer: 0 },
            { problem: 'p-n-t-', options: ['pensil', 'pental', 'pinta'], answer: 0 },
          ],
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
            { letter: 'G', emoji: '🍇', word: 'Grapes', options: ['G', 'H', 'I', 'J'], answer: 0 },
            { letter: 'H', emoji: '🏠', word: 'House', options: ['G', 'H', 'I', 'J'], answer: 1 },
            { letter: 'I', emoji: '🍦', word: 'Ice Cream', options: ['G', 'H', 'I', 'J'], answer: 2 },
            { letter: 'J', emoji: '🤹', word: 'Juggler', options: ['G', 'H', 'I', 'J'], answer: 3 },
            { letter: 'K', emoji: '🪀', word: 'Kite', options: ['J', 'K', 'L', 'M'], answer: 1 },
            { letter: 'L', emoji: '🦁', word: 'Lion', options: ['J', 'K', 'L', 'M'], answer: 2 },
            { letter: 'M', emoji: '🌙', word: 'Moon', options: ['J', 'K', 'L', 'M'], answer: 3 },
            { letter: 'N', emoji: '🥜', word: 'Nut', options: ['M', 'N', 'O', 'P'], answer: 1 },
          ],
        },
      },
      {
        title: 'Simple Sentences - Reading',
        type: 'reading',
        emoji: '📖',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'I like to play.', options: ['Play', 'Sleep', 'Eat'], answer: 0 },
            { problem: 'The cat is cute.', options: ['Cute', 'Big', 'Small'], answer: 0 },
            { problem: 'Mom cooks rice.', options: ['Rice', 'Bread', 'Noodle'], answer: 0 },
            { problem: 'Dad fixes the car.', options: ['Car', 'Bike', 'Bus'], answer: 0 },
            { problem: 'Sister plays with doll.', options: ['Doll', 'Ball', 'Toy'], answer: 0 },
            { problem: 'School is closed today.', options: ['Today', 'Tomorrow', 'Next week'], answer: 0 },
            { problem: 'We play in the park.', options: ['Park', 'Home', 'School'], answer: 0 },
            { problem: 'Brother drinks hot milk.', options: ['Milk', 'Water', 'Juice'], answer: 0 },
          ],
        },
      },
      {
        title: 'Daily Vocabulary',
        type: 'word_builder',
        emoji: '🔠',
        difficulty: 'medium',
        gameData: {
          questions: [
            { problem: 'h-u-s-', options: ['house', 'horse', 'haste'], answer: 0 },
            { problem: 's-h-o-l', options: ['school', 'shall', 'shoal'], answer: 0 },
            { problem: 'f-m-l-', options: ['family', 'female', 'formal'], answer: 0 },
            { problem: 'f-o-', options: ['food', 'fool', 'foot'], answer: 0 },
            { problem: 't-y', options: ['toy', 'try', 'tray'], answer: 0 },
            { problem: 'b-o-k', options: ['book', 'brook', 'break'], answer: 0 },
            { problem: 'p-n-i-', options: ['pencil', 'penal', 'panel'], answer: 0 },
            { problem: 't-b-l-', options: ['table', 'tablet', 'taboo'], answer: 0 },
          ],
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
            { problem: '5+3', options: ['6', '8', '9', '7'], answer: 1 },
            { problem: '7+4', options: ['9', '11', '12', '10'], answer: 1 },
            { problem: '10+5', options: ['13', '15', '16', '14'], answer: 1 },
            { problem: '6+7', options: ['11', '13', '14', '12'], answer: 1 },
            { problem: '8+5', options: ['11', '13', '14', '12'], answer: 1 },
            { problem: '9+6', options: ['13', '15', '16', '14'], answer: 1 },
            { problem: '7+8', options: ['13', '15', '16', '14'], answer: 1 },
            { problem: '11+4', options: ['13', '15', '16', '14'], answer: 1 },
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
            { problem: '10-3', options: ['5', '7', '8', '6'], answer: 1 },
            { problem: '15-5', options: ['8', '10', '11', '9'], answer: 1 },
            { problem: '20-8', options: ['10', '12', '13', '11'], answer: 1 },
            { problem: '18-7', options: ['9', '11', '12', '10'], answer: 1 },
            { problem: '16-4', options: ['10', '12', '13', '11'], answer: 1 },
            { problem: '14-6', options: ['6', '8', '9', '7'], answer: 1 },
            { problem: '19-9', options: ['8', '10', '11', '9'], answer: 1 },
            { problem: '17-5', options: ['10', '12', '13', '11'], answer: 1 },
          ],
        },
      },
      {
        title: 'Shapes & Angles',
        type: 'shape_sort',
        emoji: '📐',
        difficulty: 'medium',
        gameData: {
          questions: [
            { image: '⭕', options: ['Circle', 'Square', 'Triangle'], answer: 0 },
            { image: '⬜', options: ['Circle', 'Square', 'Triangle'], answer: 1 },
            { image: '△', options: ['Circle', 'Square', 'Triangle'], answer: 2 },
            { image: '▭', options: ['Rectangle', 'Square', 'Oval'], answer: 0 },
            { image: '⬠', options: ['Pentagon', 'Hexagon', 'Square'], answer: 0 },
            { image: '◆', options: ['Diamond', 'Square', 'Star'], answer: 0 },
            { image: '⭐', options: ['Star', 'Cross', 'Triangle'], answer: 0 },
            { image: '🔵', options: ['Oval', 'Circle', 'Egg'], answer: 1 },
          ],
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