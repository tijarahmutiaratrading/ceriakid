import { prasekolah_bahasa_melayu } from './gameData_prasekolah_bm.js';
import { prasekolah_bahasa_melayu_expansion } from './gameData_prasekolah_bm_expansion.js';
import { prasekolah_bahasa_melayu_expansion_full } from './gameData_prasekolah_bm_expansion_full.js';
import { prasekolah_english } from './gameData_prasekolah_en.js';
import { prasekolah_english_expansion } from './gameData_prasekolah_en_expansion.js';
import { prasekolah_english_expansion_full } from './gameData_prasekolah_en_expansion_full.js';
import { prasekolah_mathematics } from './gameData_prasekolah_math.js';
import { prasekolah_mathematics_expansion } from './gameData_prasekolah_math_expansion.js';
import { prasekolah_science } from './gameData_prasekolah_science.js';
import { prasekolah_science_expansion } from './gameData_prasekolah_science_expansion.js';
import { prasekolah_worksheet } from './gameData_prasekolah_worksheet.js';
import { prasekolah_bahasa_tamil } from './gameData_prasekolah_tamil.js';
import { prasekolah_bahasa_tamil_expansion } from './gameData_prasekolah_tamil_expansion.js';
import { prasekolah_bahasa_mandarin } from './gameData_prasekolah_mandarin.js';
import { prasekolah_bahasa_mandarin_expansion } from './gameData_prasekolah_mandarin_expansion.js';
import { sekolah_bahasa_melayu } from './gameData_sr_bm.js';
import { sekolah_bahasa_melayu_expansion } from './gameData_sr_bm_expansion.js';
import { sekolah_bahasa_melayu_expansion_full } from './gameData_sr_bm_expansion_full.js';
import { sekolah_jawi } from './gameData_sr_jawi.js';
import { sekolah_jawi_expansion } from './gameData_sr_jawi_expansion.js';
import { sekolah_jawi_expansion_full } from './gameData_sr_jawi_expansion_full.js';
import { sekolah_english } from './gameData_sr_english.js';
import { sekolah_english_expansion } from './gameData_sr_english_expansion.js';
import { sekolah_english_expansion_full } from './gameData_sr_english_expansion_full.js';
import { sekolah_mathematics } from './gameData_sr_math.js';
import { sekolah_mathematics_expansion } from './gameData_sr_math_expansion.js';
import { sekolah_science } from './gameData_sr_science.js';
import { sekolah_science_expansion } from './gameData_sr_science_expansion.js';
import { sekolah_bahasa_tamil } from './gameData_sr_tamil.js';
import { sekolah_bahasa_tamil_expansion } from './gameData_sr_tamil_expansion.js';
import { sekolah_bahasa_tamil_expansion_full } from './gameData_sr_tamil_expansion_full.js';
import { sekolah_bahasa_mandarin } from './gameData_sr_mandarin.js';
import { sekolah_bahasa_mandarin_expansion } from './gameData_sr_mandarin_expansion.js';
import { sekolah_bahasa_mandarin_expansion_full } from './gameData_sr_mandarin_expansion_full.js';

export const gameLibrary = {
  prasekolah: {
    bahasa_melayu: [...prasekolah_bahasa_melayu, ...prasekolah_bahasa_melayu_expansion, ...prasekolah_bahasa_melayu_expansion_full],
    english: [...prasekolah_english, ...prasekolah_english_expansion, ...prasekolah_english_expansion_full],
    mathematics: [...prasekolah_mathematics, ...prasekolah_mathematics_expansion],
    science: [...prasekolah_science, ...prasekolah_science_expansion],
    worksheet: prasekolah_worksheet,
    bahasa_tamil: [...prasekolah_bahasa_tamil, ...prasekolah_bahasa_tamil_expansion],
    bahasa_mandarin: [...prasekolah_bahasa_mandarin, ...prasekolah_bahasa_mandarin_expansion],
  },
  sekolah_rendah: {
    bahasa_melayu: [...sekolah_bahasa_melayu, ...sekolah_bahasa_melayu_expansion, ...sekolah_bahasa_melayu_expansion_full],
    jawi: [...sekolah_jawi, ...sekolah_jawi_expansion, ...sekolah_jawi_expansion_full],
    english: [...sekolah_english, ...sekolah_english_expansion, ...sekolah_english_expansion_full],
    mathematics: [...sekolah_mathematics, ...sekolah_mathematics_expansion],
    science: [...sekolah_science, ...sekolah_science_expansion],
    bahasa_tamil: [...sekolah_bahasa_tamil, ...sekolah_bahasa_tamil_expansion, ...sekolah_bahasa_tamil_expansion_full],
    bahasa_mandarin: [...sekolah_bahasa_mandarin, ...sekolah_bahasa_mandarin_expansion, ...sekolah_bahasa_mandarin_expansion_full],
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