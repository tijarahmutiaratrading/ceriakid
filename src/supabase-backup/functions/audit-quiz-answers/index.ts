// Audit quiz answers — find math questions where stored answer doesn't match computed answer
// Supports simple arithmetic & word problems. Pass dryRun:false to fix.
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';

function calc(a: number, op: string, b: number): number | null {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === 'x' || op === '*') return a * b;
  if (op === '/') return b === 0 ? null : a / b;
  return null;
}

function evaluateMath(problem: string): number | null {
  if (!problem || typeof problem !== 'string') return null;
  const norm = problem.replace(/RM/gi, '').replace(/×/g, 'x').replace(/÷/g, '/');

  let m = norm.match(/(-?\d+(?:\.\d+)?)\s*([+\-x*/])\s*(-?\d+(?:\.\d+)?)\s*=\s*\?/);
  if (m) return calc(parseFloat(m[1]), m[2], parseFloat(m[3]));

  m = norm.match(/\?\s*([+\-x*/])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    const op = m[1], b = parseFloat(m[2]), c = parseFloat(m[3]);
    if (op === '+') return c - b;
    if (op === '-') return c + b;
    if (op === 'x' || op === '*') return b === 0 ? null : c / b;
    if (op === '/') return c * b;
  }
  m = norm.match(/(-?\d+(?:\.\d+)?)\s*([+\-x*/])\s*\?\s*=\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    const a = parseFloat(m[1]), op = m[2], c = parseFloat(m[3]);
    if (op === '+') return c - a;
    if (op === '-') return a - c;
    if (op === 'x' || op === '*') return a === 0 ? null : c / a;
    if (op === '/') return a === 0 ? null : a / c;
  }

  const harga = problem.match(/RM(\d+)\s+setiap/i);
  const beli = problem.match(/(?:membeli|beli)\s+(\d+)/i);
  if (harga && beli) return parseInt(harga[1]) * parseInt(beli[1]);

  return null;
}

function findCorrectIndex(options: string[], correctValue: number): number {
  if (correctValue === null || correctValue === undefined) return -1;
  for (let i = 0; i < options.length; i++) {
    const numMatch = String(options[i]).match(/-?\d+(?:\.\d+)?/);
    if (numMatch && parseFloat(numMatch[0]) === correctValue) return i;
  }
  return -1;
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const { dryRun = true, limit = 5000 } = await req.json().catch(() => ({}));

    const { data: allGames } = await supabaseAdmin
      .from('ck_games')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    const mismatches: any[] = [];
    let totalQuestions = 0, mathChecked = 0, fixed = 0;

    for (const game of allGames || []) {
      const questions = game?.game_data?.questions;
      if (!Array.isArray(questions)) continue;

      let gameUpdated = false;
      const updatedQuestions = [...questions];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q?.options || !Array.isArray(q.options)) continue;
        totalQuestions++;

        const problem = q.problem || q.question || '';
        const correctValue = evaluateMath(problem);
        if (correctValue === null) continue;
        mathChecked++;

        const correctIndex = findCorrectIndex(q.options, correctValue);
        if (correctIndex === -1) continue;

        const currentAnswer = typeof q.answer === 'number' ? q.answer : -1;
        if (currentAnswer !== correctIndex) {
          mismatches.push({
            gameId: game.id, title: game.title, darjah: game.darjah, category: game.category,
            qIndex: i, problem, options: q.options, currentAnswer, correctIndex, correctValue,
          });
          if (!dryRun) {
            updatedQuestions[i] = { ...q, answer: correctIndex };
            gameUpdated = true;
          }
        }
      }

      if (gameUpdated && !dryRun) {
        await supabaseAdmin.from('ck_games').update({
          game_data: { ...game.game_data, questions: updatedQuestions },
        }).eq('id', game.id);
        fixed++;
      }
    }

    return jsonResponse({
      totalGames: allGames?.length || 0,
      totalQuestions, mathChecked,
      mismatchCount: mismatches.length,
      fixedGames: fixed, dryRun,
      sampleMismatches: mismatches.slice(0, 30),
      allMismatches: dryRun ? mismatches : undefined,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});