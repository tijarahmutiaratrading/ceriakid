import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// This function imports ALL games from gameLibrary into the Game entity (DB)
// Run once to seed the database

const SUBJECT_MAP = [
  { ageGroup: 'prasekolah', subject: 'bahasa_melayu', category: 'bahasa_melayu' },
  { ageGroup: 'prasekolah', subject: 'english', category: 'english' },
  { ageGroup: 'prasekolah', subject: 'mathematics', category: 'mathematics' },
  { ageGroup: 'prasekolah', subject: 'science', category: 'science' },
  { ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', category: 'bahasa_melayu' },
  { ageGroup: 'sekolah_rendah', subject: 'english', category: 'english' },
  { ageGroup: 'sekolah_rendah', subject: 'mathematics', category: 'mathematics' },
  { ageGroup: 'sekolah_rendah', subject: 'science', category: 'science' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const games = body.games; // array of game objects with ageGroup, subject, index, data

    if (!games || !Array.isArray(games)) {
      return Response.json({ error: 'games array required in body' }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const g of games) {
      try {
        // Check if game already exists in DB
        const existing = await base44.asServiceRole.entities.Game.filter({
          ageGroup: g.ageGroup,
          category: g.category,
          order: g.index,
        });

        const gameRecord = {
          title: g.title,
          type: g.type || 'multiple_choice',
          category: g.category,
          ageGroup: g.ageGroup,
          difficulty: g.difficulty || 'easy',
          tier: g.tier || 'free',
          emoji: g.emoji || '🎮',
          totalQuestions: g.gameData?.questions?.length || 8,
          gameData: g.gameData || {},
          isPublished: true,
          order: g.index,
        };

        if (existing.length > 0) {
          await base44.asServiceRole.entities.Game.update(existing[0].id, gameRecord);
          updated++;
        } else {
          await base44.asServiceRole.entities.Game.create(gameRecord);
          created++;
        }
      } catch (err) {
        errors++;
      }
    }

    return Response.json({
      success: true,
      created,
      updated,
      errors,
      total: games.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});