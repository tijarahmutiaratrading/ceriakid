import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, gameIndices, updates } = await req.json();

    if (!Array.isArray(gameIndices) || !updates || Object.keys(updates).length === 0) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Dynamic import
    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Apply updates to each game
    const results = [];
    let successCount = 0;

    gameIndices.forEach(idx => {
      if (fileContent[idx]) {
        fileContent[idx] = { ...fileContent[idx], ...updates };
        results.push({
          index: idx,
          title: fileContent[idx].title,
          status: 'updated',
        });
        successCount++;
      } else {
        results.push({
          index: idx,
          status: 'failed',
          reason: 'Game not found',
        });
      }
    });

    return Response.json({
      success: true,
      fileName,
      totalAttempted: gameIndices.length,
      successCount,
      failedCount: gameIndices.length - successCount,
      updatedFields: Object.keys(updates),
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});