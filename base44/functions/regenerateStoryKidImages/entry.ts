import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Regenerate cover image untuk setiap Story Kid game supaya gambar match dengan tema cerita.
 * Strategy: generate 1 unique cover image per story berdasarkan title + moral.
 * Scene images dibuang (set ke null) — UI akan fallback ke emoji besar.
 *
 * Batch-safe: takes { limit = 5 } per call. Re-run sehingga semua selesai.
 * Skip cerita yang dah ada custom cover (bukan dari STOCK_IMAGES list).
 */

const STOCK_IMAGES = new Set([
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f57f9479f_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0a97ddf90_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3ff2b9379_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fdbdb4e85_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f4b720a6a_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3c03de7fd_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/44f9e58a4_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d52325143_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7055e89d0_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/32fd99f2b_generated_image.png',
]);

function buildImagePrompt(title, moral, emoji) {
  return `Children's storybook illustration cover for Malaysian preschool kids (ages 4-6).
Title: "${title}". Theme: ${moral}.
Style: warm, cheerful, soft pastel colors, simple cartoon illustration, friendly Malaysian child character with brown skin and dark hair, expressive eyes, picture-book style, no text, no letters, square composition, vibrant but not overwhelming, suitable for toddlers.
Subject focus: ${emoji} ${title}.`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body.limit) || 5, 10);

    // Fetch all story kid games
    const allGames = await base44.asServiceRole.entities.Game.filter(
      { category: 'story', type: 'story_adventure' },
      '-created_date',
      200
    );

    // Find games still using stock images
    const needsUpdate = allGames.filter(g => {
      const cover = g.gameData?.cover;
      return !cover || STOCK_IMAGES.has(cover);
    });

    const totalRemaining = needsUpdate.length;
    const batch = needsUpdate.slice(0, limit);

    let updated = 0;
    let failed = 0;
    const errors = [];

    for (const game of batch) {
      try {
        const prompt = buildImagePrompt(
          game.title,
          game.gameData?.moral || game.description || 'cerita anak baik',
          game.emoji || '📖'
        );

        const imageResult = await base44.integrations.Core.GenerateImage({ prompt });
        const newCoverUrl = imageResult?.url;

        if (!newCoverUrl) {
          failed++;
          errors.push({ id: game.id, title: game.title, error: 'No image URL returned' });
          continue;
        }

        // Strip scene imageUrls (let UI fallback to emoji) + set fresh cover
        const cleanedScenes = (game.gameData?.scenes || []).map(scene => {
          const { imageUrl, ...rest } = scene;
          return rest;
        });

        await base44.asServiceRole.entities.Game.update(game.id, {
          gameData: {
            ...game.gameData,
            cover: newCoverUrl,
            scenes: cleanedScenes,
          },
        });

        updated++;
      } catch (e) {
        failed++;
        errors.push({ id: game.id, title: game.title, error: e.message });
        console.error(`Failed for ${game.title}:`, e.message);
      }
    }

    const stillRemaining = totalRemaining - updated;

    return Response.json({
      success: true,
      totalStories: allGames.length,
      totalRemaining,
      processedThisBatch: batch.length,
      updated,
      failed,
      stillRemaining,
      message: stillRemaining > 0
        ? `✅ Updated ${updated} cerita. Run lagi untuk ${stillRemaining} cerita berbaki.`
        : `✅ Semua ${allGames.length} cerita dah ada gambar unik!`,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    console.error('regenerateStoryKidImages error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});