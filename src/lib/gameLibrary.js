import { prasekolah_bahasa_melayu } from './gameData_prasekolah_bm.js';
import { prasekolah_english } from './gameData_prasekolah_en.js';
import { prasekolah_mathematics } from './gameData_prasekolah_math.js';
import { prasekolah_science } from './gameData_prasekolah_science.js';
import { prasekolah_worksheet } from './gameData_prasekolah_worksheet.js';
import { sekolah_bahasa_melayu } from './gameData_sr_bm.js';
import { sekolah_jawi } from './gameData_sr_jawi.js';
import { sekolah_english } from './gameData_sr_english.js';
import { sekolah_mathematics } from './gameData_sr_math.js';
import { sekolah_science } from './gameData_sr_science.js';

export const gameLibrary = {
  prasekolah: {
    bahasa_melayu: prasekolah_bahasa_melayu,
    english: prasekolah_english,
    mathematics: prasekolah_mathematics,
    science: prasekolah_science,
    worksheet: prasekolah_worksheet,
  },
  sekolah_rendah: {
    bahasa_melayu: sekolah_bahasa_melayu,
    jawi: sekolah_jawi,
    english: sekolah_english,
    mathematics: sekolah_mathematics,
    science: sekolah_science,
  },
};

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
  scores.push({ gameType, score, total, stars, date: new Date().toISOString() });
  if (scores.length > 50) scores.splice(0, scores.length - 50);
  localStorage.setItem('kidScores', JSON.stringify(scores));
}

export function getScores() {
  return JSON.parse(localStorage.getItem('kidScores') || '[]');
}

export function clearScores() {
  localStorage.setItem('kidScores', '[]');
}

export function getGamesByAgeAndCategory(ageGroup, category) {
  return gameLibrary[ageGroup]?.[category] || [];
}

export function getGamesByAge(ageGroup) {
  const games = gameLibrary[ageGroup] || {};
  if (ageGroup === 'sekolah_rendah') return games;
  const filtered = { ...games };
  delete filtered.jawi;
  return filtered;
}

export function getAllGamesForAge(ageGroup) {
  const games = gameLibrary[ageGroup];
  if (!games) return [];
  return Object.values(games).flat();
}