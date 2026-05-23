// Hand-crafted mini game blueprints — 80 games, 100% Malaysian context.
// Setiap kategori: 10 games dengan mekanik berbeza.
// Setiap game: 10 rounds dengan difficulty escalating (Mudah → Sederhana → Sukar).
// Content guaranteed bersih (no LLM, no auto-generation).

import { memoryMasterGames } from './miniGames/memoryMaster.js';
import { logicPuzzlesGames } from './miniGames/logicPuzzles.js';
import { speedFocusGames } from './miniGames/speedFocus.js';
import { patternGeniusGames } from './miniGames/patternGenius.js';
import { mazeAdventureGames } from './miniGames/mazeAdventure.js';
import { creativeBuilderGames } from './miniGames/creativeBuilder.js';
import { problemSolverGames } from './miniGames/problemSolver.js';
import { brainTrainingGames } from './miniGames/brainTraining.js';

export const MINI_GAME_CATEGORIES = [
  { id: 'memory_master',    title: 'Memory Master',    emoji: '🧠', color: 'from-violet-500 to-purple-500',  objective: 'Latih ingatan visual, fokus dan recall pantas.',         games: memoryMasterGames },
  { id: 'logic_puzzles',    title: 'Logic Puzzles',    emoji: '🧩', color: 'from-blue-500 to-indigo-500',    objective: 'Asah logik, padanan dan penyelesaian puzzle.',           games: logicPuzzlesGames },
  { id: 'speed_focus',      title: 'Speed Focus',      emoji: '⚡', color: 'from-yellow-400 to-orange-500',  objective: 'Latih refleks, fokus mata dan keputusan cepat.',         games: speedFocusGames },
  { id: 'pattern_genius',   title: 'Pattern Genius',   emoji: '🔷', color: 'from-cyan-500 to-sky-500',       objective: 'Kenal pola, urutan dan ritma.',                          games: patternGeniusGames },
  { id: 'maze_adventure',   title: 'Maze Adventure',   emoji: '🌀', color: 'from-emerald-500 to-teal-500',   objective: 'Cari laluan, buat pilihan dan kekalkan fokus.',          games: mazeAdventureGames },
  { id: 'creative_builder', title: 'Creative Builder', emoji: '🎨', color: 'from-pink-500 to-rose-500',      objective: 'Bina, cipta dan susun idea secara kreatif.',             games: creativeBuilderGames },
  { id: 'problem_solver',   title: 'Problem Solver',   emoji: '💡', color: 'from-amber-500 to-yellow-500',   objective: 'Selesaikan cabaran sebab-akibat dan pilihan bijak.',     games: problemSolverGames },
  { id: 'brain_training',   title: 'Brain Training',   emoji: '🏆', color: 'from-fuchsia-500 to-purple-500', objective: 'Latihan campuran untuk fokus, logik dan ketangkasan minda.', games: brainTrainingGames },
];

export function findMiniCategory(id) {
  return MINI_GAME_CATEGORIES.find(category => category.id === id) || MINI_GAME_CATEGORIES[0];
}

export function findMiniGame(categoryId, gameId) {
  const category = findMiniCategory(categoryId);
  return { category, game: category.games.find(game => game.id === gameId) || category.games[0] };
}