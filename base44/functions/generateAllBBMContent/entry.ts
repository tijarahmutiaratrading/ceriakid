import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Generates proper HTML content for all BBMResource records that have no htmlContent yet.
// Admin only.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.BBMResource.list('-created_date', 100);
    const toProcess = all.filter(r => !r.htmlContent && r.isPublished !== false);

    let done = 0;
    let failed = 0;

    for (const bbm of toProcess) {
      try {
        console.log(`Generating HTML for: ${bbm.title}`);
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Buat bahan bantu mengajar (BBM) LENGKAP dalam format HTML untuk dicetak/print sebagai PDF.

Tajuk: ${bbm.title}
Subjek: ${bbm.subject}
Tahap: ${bbm.level}
Jenis: ${bbm.type}
Penerangan: ${bbm.description || ''}

Syarat WAJIB:
1. HTML lengkap dengan <!DOCTYPE html>, <head> dan <body>
2. CSS inline dalam <style> tag — warna-warni, sesuai untuk kanak-kanak Malaysia
3. Kandungan PENUH dan BERMAKNA — bukan placeholder. Kalau lembaran kerja, ada soalan betul. Kalau carta, ada kandungan betul. Kalau RPH, ada struktur lengkap. Kalau kuiz, ada 15-20 soalan betul dengan jawapan.
4. Sesuai untuk dicetak pada A4
5. Ada nama/kelas/tarikh field kalau bersesuaian
6. Footer: "CeriaKid Educational Platform | Malaysia"
7. @media print CSS untuk print-friendly
8. Bahasa Malaysia (Melayu) kecuali subjek English
9. Minimum 2-3 muka surat konten bila di-print

Output: HTML string sahaja, tanpa markdown backtick atau penjelasan lain.`,
        });

        // result is string since no response_json_schema
        const html = typeof result === 'string' ? result : JSON.stringify(result);

        // Clean markdown if present
        const cleanHtml = html.replace(/^```html\n?/i, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

        await base44.asServiceRole.entities.BBMResource.update(bbm.id, {
          htmlContent: cleanHtml,
        });

        done++;
        console.log(`Done ${done}/${toProcess.length}: ${bbm.title}`);

        // Small delay to avoid rate limit
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        failed++;
        console.error(`Failed ${bbm.title}: ${err.message}`);
      }
    }

    return Response.json({ success: true, processed: done, failed, total: toProcess.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});