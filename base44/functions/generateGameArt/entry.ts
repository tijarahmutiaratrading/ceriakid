import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Generate gambar Pixar 3D unik untuk setiap game ikut tajuk + subjek.
// Proses ikut batch kecil supaya tak timeout. Admin run berulang sampai habis.
// Payload: { batchSize?: number } (default 6)

const SUBJECT_CONTEXT = {
  bahasa_melayu: 'Malay language learning theme, storybooks and letters',
  english: 'English language learning theme, alphabet and books',
  mathematics: 'mathematics theme, colorful numbers and counting blocks',
  science: 'science theme, friendly lab equipment and nature',
  jawi: 'Jawi/Arabic calligraphy theme, elegant script tiles',
  pendidikan_islam: 'Islamic education theme, mosque, Quran, gentle and respectful',
  pendidikan_moral: 'moral values theme, kids helping each other, kindness',
  sejarah: 'Malaysian history theme, old palace, heritage, map',
  rbt: 'design and technology theme, friendly robots and tools workshop',
  pjk: 'physical education and health theme, sports field and activity',
  seni: 'visual arts theme, painting studio, colorful and creative',
  bahasa_tamil: 'Tamil language learning theme, Tamil script',
  bahasa_mandarin: 'Mandarin language theme, Chinese characters and lanterns',
  kafa_quran: 'Quran learning theme, mosque and holy book, respectful',
  kafa_jawi: 'Jawi calligraphy theme, elegant Arabic script',
  kafa_akidah: 'Islamic faith theme, mosque, gentle and respectful',
  kafa_ibadah: 'Islamic worship theme, prayer mat and mosque',
  kafa_sirah: 'Islamic history theme, ancient desert town, respectful',
  kafa_adab: 'good manners theme, kids being polite and kind',
  kafa_bahasa_arab: 'Arabic language theme, Arabic letters',
};

function buildPrompt(game) {
  const subject = SUBJECT_CONTEXT[game.category] || 'fun educational theme for kids';
  const title = (game.title || 'Educational Game').replace(/["\n]/g, ' ').slice(0, 120);
  return `High-quality Pixar-style 3D rendered illustration for a children's educational game card. ` +
    `The game is titled "${title}". Theme: ${subject}. ` +
    `Cinematic lighting, vibrant saturated colors, soft rounded shapes, playful and friendly, ` +
    `no text or words in the image, 16:9 wide composition, depth of field, polished and professional. ` +
    `Suitable for Malaysian primary school children.`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Benarkan automation berjadual (tiada user). Jika ada user, mesti admin.
    let isScheduled = false;
    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    } catch (_) {
      isScheduled = true;
    }

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(Math.max(Number(body.batchSize) || 6, 1), 10);

    // Ambil games yang belum ada iconUrl sah
    const allGames = await base44.asServiceRole.entities.Game.filter({ isPublished: true });
    const pending = allGames.filter(g => !g.iconUrl || !String(g.iconUrl).startsWith('http'));
    const totalRemaining = pending.length;

    if (totalRemaining === 0) {
      return Response.json({ done: true, totalRemaining: 0, processed: 0, message: 'Semua game sudah ada gambar.' });
    }

    const batch = pending.slice(0, batchSize);
    const results = [];

    for (const game of batch) {
      try {
        const { url } = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: buildPrompt(game),
        });
        if (url) {
          await base44.asServiceRole.entities.Game.update(game.id, { iconUrl: url });
          results.push({ id: game.id, title: game.title, ok: true });
        } else {
          results.push({ id: game.id, title: game.title, ok: false, error: 'no url' });
        }
      } catch (e) {
        results.push({ id: game.id, title: game.title, ok: false, error: String(e.message || e) });
      }
    }

    const succeeded = results.filter(r => r.ok).length;
    return Response.json({
      done: false,
      processed: succeeded,
      attempted: batch.length,
      totalRemaining: totalRemaining - succeeded,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});