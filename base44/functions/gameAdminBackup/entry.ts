import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, fileName, backupData } = await req.json();

    if (action === 'create') {
      // Create backup
      const module = await import(`../lib/${fileName}.js`);
      const fileContent = module[Object.keys(module)[0]];

      if (!fileContent) {
        return Response.json({ error: 'File not found' }, { status: 404 });
      }

      const backup = {
        fileName,
        timestamp: new Date().toISOString(),
        gameCount: fileContent.length,
        totalQuestions: fileContent.reduce((sum, game) => sum + (game.gameData?.questions?.length || 0), 0),
        data: fileContent,
      };

      return Response.json({
        success: true,
        backup,
        backupSize: new Blob([JSON.stringify(backup)]).size,
      });
    } else if (action === 'restore' && backupData) {
      // Validate backup structure
      if (!backupData.data || !Array.isArray(backupData.data)) {
        return Response.json({ error: 'Invalid backup format' }, { status: 400 });
      }

      return Response.json({
        success: true,
        message: 'Backup validated - ready to restore',
        fileName: backupData.fileName,
        gameCount: backupData.data.length,
        timestamp: backupData.timestamp,
        // In real implementation, would save this to database
      });
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});