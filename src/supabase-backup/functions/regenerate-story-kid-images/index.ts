// Regenerate Story Kid cover images using DALL-E 3 (replaces Base44 GenerateImage)
import { handleCors, jsonResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { requireAdmin } from '../_shared/authGuards.ts';
import { generateImage } from '../_shared/llm.ts';

// Stock Base44 images we want to replace
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

function buildPrompt(title: string, moral: string, emoji: string): string {
  return `Children's storybook illustration cover for Malaysian preschool kids (ages 4-6).
Title: "${title}". Theme: ${moral}.
Style: warm, cheerful, soft pastel colors, simple cartoon illustration, friendly Malaysian child character with brown skin and dark hair, expressive eyes, picture-book style, no text, no letters, square composition, vibrant but not overwhelming, suitable for toddlers.
Subject focus: ${emoji} ${title}.`;
}

Deno.serve(async (req) => {
  const cors = handleCors(req); if (cors) return cors;
  const guard = await requireAdmin(req);
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body.limit) || 5, 10);

    const { data: allGames } = await supabaseAdmin
      .from('ck_games')
      .select('*')
      .eq('category', 'story')
      .eq('type', 'story_adventure')
      .order('created_at', { ascending: false })
      .limit(200);

    const needsUpdate = (allGames || []).filter((g: any) => {
      const cover = g.game_data?.cover;
      return !cover || STOCK_IMAGES.has(cover);
    });

    const totalRemaining = needsUpdate.length;
    const batch = needsUpdate.slice(0, limit);
    let updated = 0, failed = 0;
    const errors: any[] = [];

    for (const game of batch) {
      try {
        const prompt = buildPrompt(
          game.title,
          game.game_data?.moral || game.description || 'cerita anak baik',
          game.emoji || '📖'
        );
        const imageResult = await generateImage(prompt);
        if (!imageResult?.url) {
          failed++;
          errors.push({ id: game.id, title: game.title, error: 'No URL' });
          continue;
        }

        const cleanedScenes = (game.game_data?.scenes || []).map((scene: any) => {
          const { imageUrl, ...rest } = scene;
          return rest;
        });

        await supabaseAdmin.from('ck_games').update({
          game_data: { ...game.game_data, cover: imageResult.url, scenes: cleanedScenes },
        }).eq('id', game.id);
        updated++;
      } catch (e) {
        failed++;
        errors.push({ id: game.id, title: game.title, error: (e as Error).message });
      }
    }

    const stillRemaining = totalRemaining - updated;
    return jsonResponse({
      success: true,
      totalStories: allGames?.length || 0,
      totalRemaining, processedThisBatch: batch.length,
      updated, failed, stillRemaining,
      message: stillRemaining > 0
        ? `Updated ${updated}. Run again for ${stillRemaining} remaining.`
        : `All ${allGames?.length || 0} stories updated.`,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});