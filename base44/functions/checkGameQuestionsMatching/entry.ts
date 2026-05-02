import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ageGroup, category, autoFix } = await req.json();

    // Get all games (no filter = all games)
    const filter = {};
    if (ageGroup) filter.ageGroup = ageGroup;
    if (category) filter.category = category;
    filter.isPublished = true;

    const games = await base44.asServiceRole.entities.Game.filter(filter);

    const issues = [];
    let totalQuestions = 0;
    let problemQuestions = 0;
    let autoFixedGames = 0;
    let autoFixedQuestions = 0;

    for (const game of games) {
      const questions = game.gameData?.questions || [];
      totalQuestions += questions.length;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const problemText = q.problem || q.question || '';
        const options = q.options || [];
        const answerIdx = q.answer;
        const answerText = options[answerIdx];

        // Check 1: Empty question
        if (!problemText.trim()) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'EMPTY QUESTION',
            question: problemText,
            details: 'Soalan kosong',
          });
          continue;
        }

        // Check 2: Invalid answer index
        if (answerIdx === undefined || answerIdx === null || answerIdx < 0 || answerIdx >= options.length) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'INVALID ANSWER INDEX',
            question: problemText,
            answerIndex: answerIdx,
            optionCount: options.length,
            details: `Jawapan index ${answerIdx} tidak sah (hanya ada ${options.length} pilihan)`,
          });
          continue;
        }

        // Check 3: Answer text is empty
        if (!answerText || !answerText.trim()) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'EMPTY ANSWER TEXT',
            question: problemText,
            answerIndex: answerIdx,
            answerText: answerText,
            details: 'Pilihan jawapan betul kosong/blank',
          });
          continue;
        }

        // Check 4: All options are same
        const uniqueOptions = new Set(options.filter(o => o && o.trim()).map(o => o.trim().toLowerCase()));
        if (uniqueOptions.size === 1) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'DUPLICATE OPTIONS',
            question: problemText,
            options: options,
            details: 'Semua pilihan sama atau kosong',
          });
          continue;
        }

        // Check 5: Less than 4 valid options
        const validOptions = options.filter(o => o && o.trim());
        if (validOptions.length < 4) {
          problemQuestions++;
          issues.push({
            gameTitle: game.title,
            questionNum: i + 1,
            problem: 'INSUFFICIENT OPTIONS',
            question: problemText,
            options: options,
            validCount: validOptions.length,
            details: `Hanya ${validOptions.length} pilihan sah (perlu 4)`,
          });
          continue;
        }

        // Check 6: Emoji doesn't match any answer (semantic mismatch)
        const questionEmoji = problemText;
        const emojiToAnimalMap = {
          '🦁': ['singa', 'lion'],
          '🐘': ['gajah', 'elephant'],
          '🦒': ['jerapah', 'giraffe'],
          '🐘': ['gajah', 'elephant'],
          '🦓': ['zebra'],
          '🐒': ['monyet', 'monkey'],
          '🐅': ['harimau', 'tiger'],
          '🦊': ['rubah', 'fox'],
          '🐻': ['beruang', 'bear'],
          '🦘': ['kangaroo'],
          '🦁': ['singa', 'leo'],
          '🦅': ['elang', 'eagle'],
          '🦜': ['burung', 'parrot'],
          '🐠': ['ikan', 'fish'],
          '🐢': ['penyu', 'turtle'],
          '🦆': ['itik', 'duck'],
          '🐔': ['ayam', 'chicken'],
          '🐕': ['anjing', 'dog'],
          '🐈': ['kucing', 'cat'],
          '🐇': ['arnab', 'rabbit'],
          '🐿️': ['tupai', 'squirrel'],
        };
        
        const emojiMatch = Object.keys(emojiToAnimalMap).find(emoji => problemText.includes(emoji));
        if (emojiMatch) {
          const relatedKeywords = emojiToAnimalMap[emojiMatch];
          const answerLower = answerText.toLowerCase();
          const matchFound = relatedKeywords.some(kw => answerLower.includes(kw));
          
          if (!matchFound) {
            problemQuestions++;
            issues.push({
              gameTitle: game.title,
              questionNum: i + 1,
              problem: 'EMOJI_MISMATCH',
              question: problemText,
              emoji: emojiMatch,
              answer: answerText,
              expectedKeywords: relatedKeywords.join(', '),
              details: `Emoji ${emojiMatch} tidak match dengan jawapan "${answerText}"`,
            });
          }
        }
      }
    }

    // If autoFix enabled, fix all games with issues
    if (autoFix && issues.length > 0) {
      const gameIssueMap = {};
      for (const issue of issues) {
        if (!gameIssueMap[issue.gameTitle]) gameIssueMap[issue.gameTitle] = [];
        gameIssueMap[issue.gameTitle].push(issue);
      }
      
      for (const game of games) {
        if (gameIssueMap[game.title] && gameIssueMap[game.title].length > 0) {
          try {
            const gameQuestions = (game.gameData?.questions || []).slice();
            const gameIssues = gameIssueMap[game.title];
            let fixed = 0;
            let needsAiFix = false;
            
            // First pass: fix structural issues locally
            for (const issue of gameIssues) {
              const qIdx = issue.questionNum - 1;
              const q = gameQuestions[qIdx];
              if (!q) continue;
              
              if (issue.problem === 'INSUFFICIENT OPTIONS') {
                const opts = [...(q.options || [])];
                while (opts.length < 4) {
                  opts.push(`Option ${opts.length + 1}`);
                }
                q.options = opts;
                fixed++;
              } else if (issue.problem === 'INVALID ANSWER INDEX') {
                q.answer = 0;
                fixed++;
              } else if (issue.problem === 'EMPTY QUESTION') {
                gameQuestions.splice(qIdx, 1);
                fixed++;
              } else if (issue.problem === 'EMOJI_MISMATCH') {
                // Mark for AI fix
                needsAiFix = true;
              }
            }
            
            // Save structural fixes
            if (fixed > 0) {
              await base44.asServiceRole.entities.Game.update(game.id, {
                gameData: { ...game.gameData, questions: gameQuestions },
                totalQuestions: gameQuestions.length,
              });
              autoFixedGames++;
              autoFixedQuestions += fixed;
            }
            
            // Second pass: use AI for semantic fixes (emoji mismatches, etc)
            if (needsAiFix) {
              try {
                const validRes = await base44.asServiceRole.functions.invoke('validateGameQuestionsQuality', {
                  gameId: game.id,
                  ageGroup: game.ageGroup,
                  category: game.category,
                  questions: gameQuestions,
                });
                
                if (validRes.data.validation.summary.failed > 0) {
                  const fixRes = await base44.asServiceRole.functions.invoke('autoFixGameQuestions', {
                    gameId: game.id,
                    validationResult: validRes.data.validation,
                  });
                  autoFixedQuestions += fixRes.data.fixed || 1;
                }
              } catch (aiErr) {
                console.error(`AI fix skipped for ${game.title}:`, aiErr.message);
              }
            }
          } catch (err) {
            console.error(`Auto-fix failed for game ${game.title}:`, err.message);
          }
          
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    return Response.json({
      success: true,
      ageGroup,
      category,
      totalGames: games.length,
      totalQuestions,
      problemQuestions,
      issueCount: issues.length,
      autoFix: autoFix || false,
      autoFixedGames,
      autoFixedQuestions,
      issues: issues.slice(0, 50), // Return first 50 issues
      summary: autoFix ? `✅ Auto-fixed ${autoFixedGames} games (${autoFixedQuestions} questions)` : `Found ${issues.length} issues in ${totalQuestions} questions across ${games.length} games`,
    });
  } catch (error) {
    console.error('Check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});