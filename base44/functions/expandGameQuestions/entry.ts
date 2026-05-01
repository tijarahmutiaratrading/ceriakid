import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { fileName, gameIndex, previewOnly } = await req.json();

    if (!fileName || gameIndex === undefined) {
      return Response.json({ error: 'Missing fileName or gameIndex' }, { status: 400 });
    }

    // Dynamic import of game data file
    const module = await import(`../lib/${fileName}.js`);
    const dataKey = Object.keys(module)[0];
    const games = module[dataKey];

    if (!games || !Array.isArray(games)) {
      return Response.json({ error: 'Invalid game data' }, { status: 400 });
    }

    const game = games[gameIndex];
    if (!game) {
      return Response.json({ error: 'Game not found at index' }, { status: 404 });
    }

    // Current questions
    const currentQuestions = game.gameData?.questions || [];
    if (currentQuestions.length === 0) {
      return Response.json({ error: 'No questions found in game' }, { status: 400 });
    }

    // Get game type and format
    const gameType = game.type;
    const currentQuestion = currentQuestions[0];

    // Build prompt based on game type
    let prompt = '';
    if (gameType === 'letter_match') {
      prompt = `Berdasarkan soalan sedia ada untuk pembelajaran huruf: ${JSON.stringify(currentQuestions.slice(0, 3), null, 2)}
      
Hasilkan 12 soalan tambahan dalam format yang sama. Setiap soalan perlu:
- letter: huruf baru (pelbagai abjad)
- emoji: emoji yang sesuai dengan perkataan
- word: perkataan bahasa melayu/inggris yang bermula dengan huruf itu
- options: array 4 pilihan huruf
- answer: index jawapan yang betul (0-3)

Jangan ulang huruf atau perkataan yang sudah ada. Pastikan format JSON yang valid.`;
    } else if (gameType === 'picture_quiz') {
      prompt = `Berdasarkan soalan sedia ada untuk kuiz gambar: ${JSON.stringify(currentQuestions.slice(0, 3), null, 2)}

Hasilkan 12 soalan tambahan dalam format yang sama. Setiap soalan perlu:
- image: emoji yang sesuai
- options: array 3 pilihan jawapan
- answer: index jawapan yang betul (0-2)

Pastikan soalan bervariasi, tidak mengulangi topik yang sama. Kembalikan dalam format JSON array yang valid.`;
    } else if (gameType === 'multiple_choice') {
      prompt = `Berdasarkan soalan sedia ada untuk pilihan ganda: ${JSON.stringify(currentQuestions.slice(0, 3), null, 2)}

Hasilkan 12 soalan tambahan dalam format yang sama. Setiap soalan perlu:
- problem: soalan atau ayat yang perlu dilengkapi
- options: array 3 pilihan jawapan
- answer: index jawapan yang betul (0-2)

Soalan perlu relevan dengan topik yang sama. Format JSON array yang valid.`;
    } else if (gameType === 'sound_match') {
      prompt = `Berdasarkan soalan sedia ada untuk padanan bunyi: ${JSON.stringify(currentQuestions.slice(0, 3), null, 2)}

Hasilkan 12 soalan tambahan dalam format yang sama. Setiap soalan perlu:
- image: emoji haiwan
- options: array 4 pilihan bunyi/suara
- answer: index jawapan yang betul (0-3)

Pastikan variasi haiwan dan bunyi yang berbeza. Format JSON array yang valid.`;
    } else {
      prompt = `Berdasarkan soalan sedia ada: ${JSON.stringify(currentQuestions.slice(0, 3), null, 2)}

Hasilkan 12 soalan tambahan dalam format yang sama untuk game type "${gameType}". Kembalikan dalam format JSON array yang valid.`;
    }

    // Call LLM
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: { type: 'object' }
          }
        }
      }
    });

    const newQuestions = result.questions || [];

    if (previewOnly) {
      return Response.json({
        success: true,
        gameTitle: game.title,
        gameType: gameType,
        currentCount: currentQuestions.length,
        newCount: newQuestions.length,
        preview: newQuestions.slice(0, 3),
        totalAfterExpand: currentQuestions.length + newQuestions.length
      });
    }

    // Merge and update
    const expandedQuestions = [...currentQuestions, ...newQuestions];
    games[gameIndex].gameData.questions = expandedQuestions;

    // Return success with summary
    return Response.json({
      success: true,
      gameTitle: game.title,
      fileName: fileName,
      gameIndex: gameIndex,
      newQuestionsAdded: newQuestions.length,
      totalQuestions: expandedQuestions.length,
      message: `Game "${game.title}" updated dengan ${newQuestions.length} soalan baru!`
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});