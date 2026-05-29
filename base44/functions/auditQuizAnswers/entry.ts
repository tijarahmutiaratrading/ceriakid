// Admin-only: scan ALL games and find questions where the marked answer
// (gameData.questions[i].answer index) doesn't match the actually correct option.
// Uses simple math evaluation for arithmetic problems (e.g. "6 x 4 = ?", "10 - 4 = ?").
// For non-math problems we skip (can't auto-verify without LLM).
//
// Returns a report:
//   { totalGames, totalQuestions, mathChecked, mismatches: [{gameId, title, qIndex, problem, options, currentAnswer, correctIndex}], fixed }
//
// Pass {dryRun: false} to actually update entities with the corrected answer indices.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Try to evaluate a math expression from a problem string.
// Supports: "6 + 4 = ?", "10 - 4 = ?", "6 x 4 = ?", "6 × 4 = ?", "6 * 4 = ?", "12 ÷ 3 = ?", "12 / 3 = ?",
// "? + 3 = 10", "10 = 6 + ?", "RMx + RMy", word problems with "harga RMx setiap satu" + "membeli N"
// Returns numeric answer or null if cannot evaluate.
function evaluateMath(problem) {
  if (!problem || typeof problem !== 'string') return null;
  // Strip currency prefix for matching
  const norm = problem.replace(/RM/gi, '').replace(/×/g, 'x').replace(/÷/g, '/');

  // Pattern 1: "A op B = ?" where A,B are numbers
  // e.g. "6 + 4 = ?"  "10 - 4 = ?"  "6 x 4 = ?"  "12 / 3 = ?"
  let m = norm.match(/(-?\d+(?:\.\d+)?)\s*([+\-x*/])\s*(-?\d+(?:\.\d+)?)\s*=\s*\?/);
  if (m) {
    const a = parseFloat(m[1]); const op = m[2]; const b = parseFloat(m[3]);
    return calc(a, op, b);
  }

  // Pattern 2: "? op B = C"  => A = C op⁻¹ B
  m = norm.match(/\?\s*([+\-x*/])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    const op = m[1]; const b = parseFloat(m[2]); const c = parseFloat(m[3]);
    if (op === '+') return c - b;
    if (op === '-') return c + b;
    if (op === 'x' || op === '*') return b === 0 ? null : c / b;
    if (op === '/') return c * b;
  }

  // Pattern 3: "A op ? = C" => ? = C op⁻¹ A (depends on op)
  m = norm.match(/(-?\d+(?:\.\d+)?)\s*([+\-x*/])\s*\?\s*=\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    const a = parseFloat(m[1]); const op = m[2]; const c = parseFloat(m[3]);
    if (op === '+') return c - a;
    if (op === '-') return a - c;
    if (op === 'x' || op === '*') return a === 0 ? null : c / a;
    if (op === '/') return a === 0 ? null : a / c;
  }

  // Pattern 4: "C = A op ?" => ? = C op⁻¹ A
  m = norm.match(/(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)\s*([+\-x*/])\s*\?/);
  if (m) {
    const c = parseFloat(m[1]); const a = parseFloat(m[2]); const op = m[3];
    if (op === '+') return c - a;
    if (op === '-') return a - c;
    if (op === 'x' || op === '*') return a === 0 ? null : c / a;
    if (op === '/') return a === 0 ? null : a / c;
  }

  // Pattern 5: "C = ? op B"
  m = norm.match(/(-?\d+(?:\.\d+)?)\s*=\s*\?\s*([+\-x*/])\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    const c = parseFloat(m[1]); const op = m[2]; const b = parseFloat(m[3]);
    if (op === '+') return c - b;
    if (op === '-') return c + b;
    if (op === 'x' || op === '*') return b === 0 ? null : c / b;
    if (op === '/') return c * b;
  }

  // Word problem pattern: "membeli N X dengan harga RMP setiap satu" => total = N * P
  m = problem.match(/(\d+)\s+\S+.*?harga\s+RM(\d+)\s+setiap/i);
  if (m) {
    const n = parseInt(m[1]); const p = parseInt(m[2]);
    return n * p;
  }

  // Word: "harga RMP setiap" + "membeli N" (different order)
  const harga = problem.match(/RM(\d+)\s+setiap/i);
  const beli = problem.match(/(?:membeli|beli)\s+(\d+)/i);
  if (harga && beli) return parseInt(harga[1]) * parseInt(beli[1]);

  return null;
}

function calc(a, op, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === 'x' || op === '*') return a * b;
  if (op === '/') return b === 0 ? null : a / b;
  return null;
}

// Find which option index matches the correct numeric answer.
// Options can be "RM24", "24", "24 biji", "4 tiket". Extract the first number.
function findCorrectIndex(options, correctValue) {
  if (correctValue === null || correctValue === undefined) return -1;
  for (let i = 0; i < options.length; i++) {
    const opt = String(options[i]);
    const numMatch = opt.match(/-?\d+(?:\.\d+)?/);
    if (numMatch && parseFloat(numMatch[0]) === correctValue) return i;
  }
  return -1;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dryRun = true, limit = 5000 } = await req.json().catch(() => ({}));

    // Fetch all games, paginated
    const pageSize = 200;
    let skip = 0;
    let allGames = [];
    while (allGames.length < limit) {
      const batch = await base44.asServiceRole.entities.Game.list('-created_date', pageSize, skip);
      if (!batch || batch.length === 0) break;
      allGames = allGames.concat(batch);
      if (batch.length < pageSize) break;
      skip += pageSize;
    }

    const mismatches = [];
    let totalQuestions = 0;
    let mathChecked = 0;
    let fixed = 0;

    for (const game of allGames) {
      const questions = game?.gameData?.questions;
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
        if (correctIndex === -1) continue; // can't find — skip

        const currentAnswer = typeof q.answer === 'number' ? q.answer : -1;
        if (currentAnswer !== correctIndex) {
          mismatches.push({
            gameId: game.id,
            title: game.title,
            darjah: game.darjah,
            category: game.category,
            qIndex: i,
            problem,
            options: q.options,
            currentAnswer,
            correctIndex,
            correctValue,
          });

          if (!dryRun) {
            updatedQuestions[i] = { ...q, answer: correctIndex };
            gameUpdated = true;
          }
        }
      }

      if (gameUpdated && !dryRun) {
        await base44.asServiceRole.entities.Game.update(game.id, {
          gameData: { ...game.gameData, questions: updatedQuestions },
        });
        fixed++;
      }
    }

    return Response.json({
      totalGames: allGames.length,
      totalQuestions,
      mathChecked,
      mismatchCount: mismatches.length,
      fixedGames: fixed,
      dryRun,
      sampleMismatches: mismatches.slice(0, 30),
      allMismatches: dryRun ? mismatches : undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});