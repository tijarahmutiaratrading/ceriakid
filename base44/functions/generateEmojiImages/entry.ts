import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Jana gambar AI untuk setiap emoji unik dalam mini games, simpan kekal dalam
// entity EmojiImage. Dipanggil oleh admin SEKALI sahaja (jimat kredit — satu
// gambar per emoji, bukan per item). Renderer kemudian auto-tukar emoji → gambar.
//
// Payload (admin only):
//   - emojis: [{ emoji: '🚗', label: 'kereta' }, ...]   (senarai emoji unik + label BM)
//   - overwrite?: boolean   (default false — skip yang sudah ada gambar)
//
// Fire-and-forget background loop — admin boleh tutup browser.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { emojis = [], overwrite = false } = body;

    if (!Array.isArray(emojis) || emojis.length === 0) {
      return Response.json({ error: 'Senarai emoji kosong' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    // Ambil emoji yang sudah ada dalam DB
    const existing = await sr.entities.EmojiImage.list('-created_date', 2000);
    const byEmoji = new Map();
    existing.forEach(e => { if (e.emoji) byEmoji.set(e.emoji, e); });

    // Tentukan emoji yang perlu dijana
    const toProcess = emojis.filter(({ emoji }) => {
      const rec = byEmoji.get(emoji);
      if (!rec) return true;
      if (overwrite) return true;
      return rec.status !== 'done' || !rec.imageUrl;
    });

    if (toProcess.length === 0) {
      return Response.json({ message: 'Semua emoji sudah ada gambar.', total: 0, started: false });
    }

    const response = Response.json({
      message: `⏳ Background generate dimulakan untuk ${toProcess.length} emoji. Tutup browser pun okay!`,
      total: toProcess.length,
      started: true,
    });

    (async () => {
      for (const { emoji, label } of toProcess) {
        try {
          const subject = label || emoji;
          const prompt = `A cute, vibrant, child-friendly 3D cartoon illustration of a single "${subject}". Pixar/Disney style, bright clean solid pastel background, large centered subject, glossy toy look, soft shadows, no text, no letters, square format. Suitable for a colorful Malaysian kids learning app.`;

          const result = await sr.integrations.Core.GenerateImage({ prompt });

          const rec = byEmoji.get(emoji);
          if (result?.url) {
            if (rec) {
              await sr.entities.EmojiImage.update(rec.id, { imageUrl: result.url, label: subject, status: 'done' });
            } else {
              const created = await sr.entities.EmojiImage.create({ emoji, label: subject, imageUrl: result.url, status: 'done' });
              byEmoji.set(emoji, created);
            }
          } else {
            if (rec) await sr.entities.EmojiImage.update(rec.id, { status: 'failed' });
            else byEmoji.set(emoji, await sr.entities.EmojiImage.create({ emoji, label: subject, status: 'failed' }));
          }

          await new Promise(r => setTimeout(r, 500));
        } catch (_) {
          // teruskan ke emoji seterusnya
        }
      }
    })();

    return response;
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});