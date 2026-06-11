// 📚 MODUL 3M — Membaca, Menulis, Mengira.
// Kemahiran asas literasi & numerasi untuk prasekolah + darjah rendah.
// Guna mekanik mini game sedia ada (MiniGameModeRenderer) supaya terus boleh dimainkan.

import { membacaGames } from './tigaM/membaca.js';
import { menulisGames } from './tigaM/menulis.js';
import { mengiraGames } from './tigaM/mengira.js';

export const TIGA_M_CATEGORIES = [
  {
    id: 'membaca',
    title: 'Membaca',
    emoji: '📖',
    color: 'from-blue-500 to-indigo-500',
    objective: 'Konstruk LINUS: huruf → suku kata terbuka/tertutup → diftong.',
    games: membacaGames,
  },
  {
    id: 'menulis',
    title: 'Menulis',
    emoji: '✍️',
    color: 'from-emerald-500 to-teal-500',
    objective: 'Konstruk LINUS: surih → perkataan → imbuhan → ayat mudah.',
    games: menulisGames,
  },
  {
    id: 'mengira',
    title: 'Mengira',
    emoji: '🔢',
    color: 'from-amber-500 to-orange-500',
    objective: 'Konstruk LINUS: angka → bilang → nilai → wang → waktu → operasi.',
    games: mengiraGames,
  },
];

export function findTigaMCategory(id) {
  return TIGA_M_CATEGORIES.find(c => c.id === id) || TIGA_M_CATEGORIES[0];
}

export function findTigaMGame(categoryId, gameId) {
  const category = findTigaMCategory(categoryId);
  return { category, game: category.games.find(g => g.id === gameId) || category.games[0] };
}