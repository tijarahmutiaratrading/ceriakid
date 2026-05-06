import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const subjects = { bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi', pendidikan_islam: 'Pendidikan Islam', pendidikan_moral: 'Pendidikan Moral', sejarah: 'Sejarah' };
const levels = { prasekolah: 'Prasekolah', darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3', darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6' };
const types = {
  lembaran_kerja: ['Lembaran Kerja', '📄'], kuiz: ['Kuiz', '🧩'], rancangan_pengajaran: ['RPH', '📝'],
  kad_imbasan: ['Kad Imbasan', '🃏'], carta: ['Carta', '📊'], modul: ['Modul', '📦'], aktiviti: ['Aktiviti', '🎯'], permainan_bilik_darjah: ['Permainan Bilik Darjah', '🎲'],
};

function sanitizeItems(items) {
  const badHeading = /^(soalan|item|latihan|aktiviti pembelajaran|umum)$/i;
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      heading: String(item.heading || '').replace(/^\s*(soalan|item|latihan)\s*\d+\s*[:\-.]?\s*/i, '').trim(),
      content: String(item.content || '').trim(),
      answer: String(item.answer || '').trim(),
    }))
    .filter(item => item.heading.length >= 8 && item.content.length >= 20 && !badHeading.test(item.heading));
}

function renderHtml(data, meta) {
  const items = sanitizeItems(data.items);
  return `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;max-width:820px;margin:0 auto;padding:24px;color:#1f2937;line-height:1.45}h1{text-align:center;color:#4f46e5}h2{text-align:center;color:#64748b;font-size:14px}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.box{border:1px solid #c7d2fe;background:#eef2ff;border-radius:12px;padding:12px}.item{break-inside:avoid;margin:14px 0;padding:14px;border:1px solid #e5e7eb;border-left:5px solid #6366f1;border-radius:12px;background:#fafafa}.item h3{margin:0 0 8px;color:#4338ca}.answer{margin-top:10px;color:#047857;font-size:13px;font-weight:bold}footer{margin-top:28px;text-align:center;color:#64748b;font-size:11px;border-top:1px solid #e5e7eb;padding-top:12px}@media print{body{padding:12px}.item{page-break-inside:avoid}}</style></head><body><h1>${data.title || meta.type}</h1><h2>${meta.subject} | ${meta.level} | ${meta.type}</h2><div class="meta"><div class="box">Nama: __________________</div><div class="box">Kelas: __________________</div><div class="box">Tarikh: _________________</div></div><div class="box"><strong>Arahan:</strong> ${data.instructions || 'Gunakan bahan ini semasa pembelajaran.'}</div>${items.map((item, i) => `<div class="item"><h3>${i + 1}. ${item.heading}</h3><div>${item.content}</div>${item.answer ? `<div class="answer">Jawapan/Nota: ${item.answer}</div>` : ''}</div>`).join('')}<footer>CeriaKid Educational Platform | Malaysia</footer></body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const { subject, level, type, topic, count = 10, autoPublish = false } = await req.json();
    if (!subjects[subject] || !levels[level] || !types[type]) return Response.json({ error: 'Pilihan BBM tidak sah' }, { status: 400 });

    const [typeLabel, emoji] = types[type];
    const subjectLabel = subjects[subject];
    const levelLabel = levels[level];
    const languageRule = subject === 'english'
      ? 'WAJIB hasilkan semua title, description, instructions, content dan answer dalam English sahaja. Jangan guna Bahasa Melayu kecuali label metadata.'
      : 'Gunakan Bahasa Melayu Malaysia baku untuk semua kandungan.';
    const data = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Anda ialah guru pakar KSSR/DSKP Malaysia. Jana ${typeLabel} lengkap, berkualiti dan siap cetak A4 untuk ${subjectLabel} ${levelLabel}. Topik: ${topic || 'umum'}. Bilangan item/soalan: ${count}. ${languageRule}

WAJIB ikut standard generator CeriaKid:
1. Kandungan mesti spesifik kepada topik, bukan umum atau berulang.
2. Setiap item mesti ada kemahiran jelas, soalan/aktiviti penuh, dan jawapan/skema tepat.
3. Guna contoh tempatan Malaysia yang sesuai umur dan selari KSSR/DSKP.
4. Variasikan aras mudah-sederhana-tinggi secara seimbang.
5. DILARANG placeholder: "Soalan 1", "Item", "Latihan", "Gambar di bawah", "lihat gambar", atau content kosong.
6. DILARANG fakta meragukan, bahasa rojak, bahasa Indonesia tidak sesuai, dan tajuk generik.
7. Setiap heading mesti menerangkan kemahiran khusus seperti "Kenal Pasti Kata Nama Am" atau "Selesaikan Tambah Dalam Lingkungan 100".
8. Untuk RPH, mesti ada objektif, set induksi, aktiviti, pentaksiran dan refleksi ringkas.
9. Untuk lembaran/kuiz/kad imbasan, mesti ada item yang terus boleh digunakan murid.

Pulangkan JSON sahaja: title, description, instructions, items array dengan heading, content, answer.`,
      response_json_schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, instructions: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { heading: { type: 'string' }, content: { type: 'string' }, answer: { type: 'string' } } } } } },
    });

    const cleanItems = sanitizeItems(data.items);
    if (cleanItems.length < Math.min(Number(count), 5)) {
      return Response.json({ error: 'BBM quality check failed: item tidak cukup lengkap' }, { status: 400 });
    }
    const cleanData = { ...data, items: cleanItems };
    const htmlContent = renderHtml(cleanData, { subject: subjectLabel, level: levelLabel, type: typeLabel });
    const saved = await base44.asServiceRole.entities.BBMResource.create({ title: data.title || `${typeLabel} - ${subjectLabel} ${levelLabel}`, description: data.description || `Jana AI | ${topic || 'Umum'}`, subject, level, type, emoji, tier: 'free', downloadCount: 0, isPublished: Boolean(autoPublish), tags: [subjectLabel, levelLabel, topic || 'AI Generated', typeLabel], htmlContent });
    return Response.json({ success: true, bbmId: saved.id, title: saved.title, htmlContent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});