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
    const games = module[Object.keys(module)[0]];

    if (!games || games.length === 0) {
      return Response.json({ error: 'File kosong' }, { status: 400 });
    }

    const deleteCount = Math.min(5, games.length);
    const deleted = games.splice(games.length - deleteCount, deleteCount);

    return Response.json({
      success: true,
      fileName,
      totalGames: games.length,
      deletedCount: deleteCount,
      deletedTitles: deleted.map(g => g.title),
      message: `✅ ${deleteCount} games dihapus. Total sekarang: ${games.length}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});