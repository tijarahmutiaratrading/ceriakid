import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, fromIndex, toIndex } = await req.json();

    const module = await import(`../lib/${fileName}.js`);
    const fileContent = module[Object.keys(module)[0]];

    if (!fileContent || !fileContent[fromIndex] || toIndex < 0 || toIndex >= fileContent.length) {
      return Response.json({ error: 'Invalid indices' }, { status: 400 });
    }

    const [movedGame] = fileContent.splice(fromIndex, 1);
    fileContent.splice(toIndex, 0, movedGame);

    return Response.json({
      success: true,
      message: `Moved "${movedGame.title}" from position ${fromIndex} to ${toIndex}`,
      moved: {
        title: movedGame.title,
        fromIndex,
        toIndex,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});