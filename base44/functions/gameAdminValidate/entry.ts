import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName } = await req.json();

    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    const issues = [];
    const warnings = [];

    fileContent.forEach((game, idx) => {
      // Critical checks
      if (!game.title) issues.push(`Game ${idx}: Missing title`);
      if (!game.type) issues.push(`Game ${idx}: Missing type`);
      if (!game.emoji) warnings.push(`Game ${idx}: Missing emoji`);
      
      const questions = game.gameData?.questions || [];
      if (questions.length === 0) issues.push(`Game ${idx}: No questions`);
      
      questions.forEach((q, qIdx) => {
        if (!q.options || q.options.length < 2) {
          issues.push(`Game ${idx}, Question ${qIdx}: Less than 2 options`);
        }
        if (q.answer === undefined || q.answer < 0 || q.answer >= (q.options?.length || 0)) {
          issues.push(`Game ${idx}, Question ${qIdx}: Invalid answer index`);
        }
      });
    });

    return Response.json({
      success: issues.length === 0,
      fileName,
      totalGames: fileContent.length,
      issues,
      warnings,
      isValid: issues.length === 0,
      message: issues.length === 0 ? '✅ All games valid' : `❌ Found ${issues.length} issue(s)`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});