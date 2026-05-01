import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameIndex, action, questionIndex, questionData } = await req.json();

    // Dynamic import
    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent || !fileContent[gameIndex]) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const game = fileContent[gameIndex];
    const questions = game.gameData?.questions || [];

    let result;

    if (action === 'view') {
      // View specific question
      if (questionIndex !== undefined && questions[questionIndex]) {
        result = {
          index: questionIndex,
          data: questions[questionIndex],
        };
      } else {
        result = {
          total: questions.length,
          questions: questions.map((q, idx) => ({ index: idx, ...q })),
        };
      }
    } else if (action === 'update' && questionData) {
      // Update question
      if (questionIndex !== undefined && questions[questionIndex]) {
        questions[questionIndex] = { ...questions[questionIndex], ...questionData };
        result = {
          success: true,
          message: `Question ${questionIndex} updated`,
          updated: questions[questionIndex],
        };
      }
    } else if (action === 'delete') {
      // Delete question
      if (questionIndex !== undefined && questions[questionIndex]) {
        questions.splice(questionIndex, 1);
        result = {
          success: true,
          message: `Question ${questionIndex} deleted`,
          remainingQuestions: questions.length,
        };
      }
    } else if (action === 'add' && questionData) {
      // Add new question
      questions.push(questionData);
      result = {
        success: true,
        message: 'New question added',
        newIndex: questions.length - 1,
        totalQuestions: questions.length,
      };
    }

    return Response.json({ success: true, gameIndex, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});