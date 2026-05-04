import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUBJECTS = { bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi', pendidikan_islam: 'Pendidikan Islam', pendidikan_moral: 'Pendidikan Moral', sejarah: 'Sejarah' };
const LEVELS = { prasekolah: 'Prasekolah', darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3', darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6' };
const TYPES = {
  lembaran_kerja: ['Lembaran Kerja', '📄'], kuiz: ['Kuiz', '🧩'], rancangan_pengajaran: ['RPH', '📝'], kad_imbasan: ['Kad Imbasan', '🃏'],
  carta: ['Carta', '📊'], modul: ['Modul', '📦'], aktiviti: ['Aktiviti', '🎯'], permainan_bilik_darjah: ['Permainan Bilik Darjah', '🎲']
};

const esc = (v) => String(v || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function makeHtml(data, meta) {
  const items = Array.isArray(data.items) ? data.items : [];
  const rows = items.map((it, i) => `<section class="item"><h3>${i + 1}. ${esc(it.heading || 'Item')}</h3><p>${esc(it.content)}</p>${it.answer ? `<p class="answer">Jawapan/Nota: ${esc(it.answer)}</p>` : ''}</section>`).join('');
  return `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;max-width:820px;margin:auto;padding:24px;color:#1f2937}h1{text-align:center;color:#4f46e5}h2{text-align:center;color:#64748b;font-size:14px}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.box,.item{border:1px solid #c7d2fe;border-radius:12px;padding:12px}.box{background:#eef2ff}.item{margin:14px 0;border-left:5px solid #6366f1;background:#fafafa;break-inside:avoid}.answer{color:#047857;font-weight:bold}footer{text-align:center;color:#64748b;font-size:11px;margin-top:28px;border-top:1px solid #eee;padding-top:12px}@media print{body{padding:12px}.item{page-break-inside:avoid}}</style></head><body><h1>${esc(data.title || meta.typeLabel)}</h1><h2>${esc(meta.subjectLabel)} | ${esc(meta.levelLabel)} | ${esc(meta.typeLabel)}</h2><div class="meta"><div class="box">Nama: ____________</div><div class="box">Kelas: ____________</div><div class="box">Tarikh: ____________</div></div><div class="box"><b>Arahan:</b> ${esc(data.instructions || 'Gunakan bahan ini semasa pembelajaran.')}</div>${rows}<footer>CeriaKid Educational Platform | Malaysia</footer></body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { subject, level, type, topic, count = 10, autoPublish = false } = body;
    if (!SUBJECTS[subject] || !LEVELS[level] || !TYPES[type]) return Response.json({ error: 'Pilihan BBM tidak sah' }, { status: 400 });

    const [typeLabel, emoji] = TYPES[type];
    const subjectLabel = SUBJECTS[subject];
    const levelLabel = LEVELS[level];
    const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Anda ialah guru pakar KSSR/DSKP Malaysia. Jana ${typeLabel} lengkap, berkualiti dan siap cetak A4 untuk ${subjectLabel} ${levelLabel}. Topik: ${topic || 'umum'}. Buat ${count} item. Wajib ada objektif pembelajaran jelas, arahan murid yang mudah, kandungan selari tahap umur, soalan pelbagai aras mudah-sederhana, contoh tempatan Malaysia, jawapan/skema ringkas, tiada placeholder dan tiada fakta meragukan. DILARANG guna heading seperti "Soalan 1", "Item", "Gambar di bawah", atau arahan "lihat gambar" jika tiada imej sebenar. Setiap heading mesti menerangkan kemahiran khusus seperti "Kenal Pasti Kata Nama Am". Output JSON sahaja: title, description, instructions, items[{heading,content,answer}].`,
      response_json_schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, instructions: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { heading: { type: 'string' }, content: { type: 'string' }, answer: { type: 'string' } } } } } }
    });

    const htmlContent = makeHtml(ai, { subjectLabel, levelLabel, typeLabel });
    const saved = await base44.asServiceRole.entities.BBMResource.create({ title: ai.title || `${typeLabel} - ${subjectLabel}`, description: ai.description || `Jana AI | ${topic || 'Umum'}`, subject, level, type, emoji, tier: 'free', downloadCount: 0, isPublished: Boolean(autoPublish), tags: [subjectLabel, levelLabel, typeLabel, topic || 'AI'], htmlContent });
    return Response.json({ success: true, bbmId: saved.id, title: saved.title, htmlContent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});