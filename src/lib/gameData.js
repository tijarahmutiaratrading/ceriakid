// ABC Game Data
export const letterQuestions = [
  { letter: 'A', emoji: '🍎', wordBM: 'Epal', wordEN: 'Apple' },
  { letter: 'B', emoji: '🐦', wordBM: 'Burung', wordEN: 'Bird' },
  { letter: 'C', emoji: '🐱', wordBM: 'Kucing', wordEN: 'Cat' },
  { letter: 'D', emoji: '🐕', wordBM: 'Anjing', wordEN: 'Dog' },
  { letter: 'E', emoji: '🐘', wordBM: 'Gajah', wordEN: 'Elephant' },
  { letter: 'F', emoji: '🐟', wordBM: 'Ikan', wordEN: 'Fish' },
  { letter: 'G', emoji: '🍇', wordBM: 'Anggur', wordEN: 'Grapes' },
  { letter: 'H', emoji: '🏠', wordBM: 'Rumah', wordEN: 'House' },
  { letter: 'I', emoji: '🍦', wordBM: 'Ais Krim', wordEN: 'Ice Cream' },
  { letter: 'J', emoji: '🤹', wordBM: 'Juggling', wordEN: 'Juggler' },
  { letter: 'K', emoji: '🪁', wordBM: 'Wau', wordEN: 'Kite' },
  { letter: 'L', emoji: '🦁', wordBM: 'Singa', wordEN: 'Lion' },
  { letter: 'M', emoji: '🌙', wordBM: 'Bulan', wordEN: 'Moon' },
];

// Number Game Data
export const numberQuestions = [
  { number: 1, emoji: '🌟', countEmoji: '🌟' },
  { number: 2, emoji: '👀', countEmoji: '🍎' },
  { number: 3, emoji: '🎈', countEmoji: '🎈' },
  { number: 4, emoji: '🦋', countEmoji: '🦋' },
  { number: 5, emoji: '✋', countEmoji: '🌸' },
  { number: 6, emoji: '🎲', countEmoji: '🐟' },
  { number: 7, emoji: '🌈', countEmoji: '🌺' },
  { number: 8, emoji: '🐙', countEmoji: '🍊' },
  { number: 9, emoji: '🎯', countEmoji: '⭐' },
  { number: 10, emoji: '🔟', countEmoji: '🎵' },
];

// Quiz Game Data
export const quizQuestions = {
  bm: [
    { question: 'Haiwan apakah ini? 🐱', options: ['Kucing', 'Anjing', 'Arnab', 'Burung'], answer: 0 },
    { question: 'Buah apakah ini? 🍌', options: ['Epal', 'Pisang', 'Anggur', 'Oren'], answer: 1 },
    { question: 'Kenderaan apakah ini? 🚗', options: ['Bas', 'Kapal', 'Kereta', 'Basikal'], answer: 2 },
    { question: 'Berapakah bilangan ini? 🌟🌟🌟', options: ['2', '3', '4', '5'], answer: 1 },
    { question: 'Warna apakah ini? 🔵', options: ['Merah', 'Hijau', 'Biru', 'Kuning'], answer: 2 },
    { question: 'Haiwan apakah yang tinggal di air? 🐟', options: ['Kucing', 'Ikan', 'Burung', 'Kuda'], answer: 1 },
    { question: 'Apakah bentuk ini? ⭐', options: ['Bulatan', 'Segi Empat', 'Segi Tiga', 'Bintang'], answer: 3 },
    { question: 'Berapa banyak? 🍎🍎🍎🍎🍎', options: ['3', '4', '5', '6'], answer: 2 },
    { question: 'Makanan apakah ini? 🍕', options: ['Nasi', 'Pizza', 'Roti', 'Mee'], answer: 1 },
    { question: 'Tempat apakah ini? 🏫', options: ['Rumah', 'Pasar', 'Sekolah', 'Taman'], answer: 2 },
  ],
  en: [
    { question: 'What animal is this? 🐱', options: ['Cat', 'Dog', 'Rabbit', 'Bird'], answer: 0 },
    { question: 'What fruit is this? 🍌', options: ['Apple', 'Banana', 'Grapes', 'Orange'], answer: 1 },
    { question: 'What vehicle is this? 🚗', options: ['Bus', 'Ship', 'Car', 'Bicycle'], answer: 2 },
    { question: 'How many stars? 🌟🌟🌟', options: ['2', '3', '4', '5'], answer: 1 },
    { question: 'What color is this? 🔵', options: ['Red', 'Green', 'Blue', 'Yellow'], answer: 2 },
    { question: 'Which animal lives in water? 🐟', options: ['Cat', 'Fish', 'Bird', 'Horse'], answer: 1 },
    { question: 'What shape is this? ⭐', options: ['Circle', 'Square', 'Triangle', 'Star'], answer: 3 },
    { question: 'How many? 🍎🍎🍎🍎🍎', options: ['3', '4', '5', '6'], answer: 2 },
    { question: 'What food is this? 🍕', options: ['Rice', 'Pizza', 'Bread', 'Noodle'], answer: 1 },
    { question: 'What place is this? 🏫', options: ['Home', 'Market', 'School', 'Park'], answer: 2 },
  ]
};

// Shapes & Colors Game Data
export const shapeItems = [
  { id: 'circle', shape: 'circle', colorClass: 'bg-game-red', emoji: '🔴' },
  { id: 'square', shape: 'square', colorClass: 'bg-game-blue', emoji: '🟦' },
  { id: 'triangle', shape: 'triangle', colorClass: 'bg-game-green', emoji: '🔺' },
  { id: 'star', shape: 'star', colorClass: 'bg-game-yellow', emoji: '⭐' },
  { id: 'heart', shape: 'heart', colorClass: 'bg-game-pink', emoji: '💖' },
  { id: 'diamond', shape: 'diamond', colorClass: 'bg-game-purple', emoji: '💎' },
];

export const colorItems = [
  { id: 'red', color: 'bg-game-red', emoji: '🔴' },
  { id: 'blue', color: 'bg-game-blue', emoji: '🔵' },
  { id: 'green', color: 'bg-game-green', emoji: '🟢' },
  { id: 'yellow', color: 'bg-game-yellow', emoji: '🟡' },
  { id: 'pink', color: 'bg-game-pink', emoji: '🩷' },
  { id: 'orange', color: 'bg-game-orange', emoji: '🟠' },
  { id: 'purple', color: 'bg-game-purple', emoji: '🟣' },
];

// Utility to shuffle arrays
export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Calculate stars based on score percentage
export function calculateStars(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

// Save score to localStorage
export function saveScore(gameType, score, total, stars) {
  const scores = JSON.parse(localStorage.getItem('kidScores') || '[]');
  scores.push({
    gameType,
    score,
    total,
    stars,
    date: new Date().toISOString(),
  });
  // Keep last 50 scores
  if (scores.length > 50) scores.splice(0, scores.length - 50);
  localStorage.setItem('kidScores', JSON.stringify(scores));
}

// Get scores from localStorage
export function getScores() {
  return JSON.parse(localStorage.getItem('kidScores') || '[]');
}

// Clear scores
export function clearScores() {
  localStorage.setItem('kidScores', '[]');
}