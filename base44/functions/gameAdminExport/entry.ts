import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, format = 'json' } = await req.json();

    // Dynamic import
    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    let exportData;

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['Index', 'Title', 'Type', 'Category', 'Difficulty', 'Questions', 'Tier'];
      const rows = fileContent.map((game, idx) => [
        idx,
        `"${game.title}"`,
        game.type,
        game.category,
        game.difficulty || 'easy',
        game.gameData?.questions?.length || 0,
        game.tier || 'free',
      ]);
      
      exportData = [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      // JSON format
      exportData = JSON.stringify(fileContent, null, 2);
    }

    return Response.json({
      success: true,
      fileName,
      format,
      data: exportData,
      size: new Blob([exportData]).size,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});