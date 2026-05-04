import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const subjects = { bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi', pendidikan_islam: 'Pendidikan Islam', pendidikan_moral: 'Pendidikan Moral', sejarah: 'Sejarah' };
const levels = { prasekolah: 'Prasekolah', darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3', darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6' };
const types = {
  lembaran_kerja: ['Lembaran Kerja', '📄'], kuiz: ['Kuiz', '🧩'], rancangan_pengajaran: ['RPH', '📝'],
  kad_imbasan: ['Kad Imbasan', '🃏'], carta: ['Carta', '📊'], modul: ['Modul', '📦'], aktiviti: ['Aktiviti', '🎯'], permainan_bilik_darjah: ['Permainan Bilik Darjah', '🎲'],
};

function renderHtml(data, meta) {
  const items = Array.isArray(data.items) ? data.items : [];
  return `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;max-width:820px;margin:0 auto;padding:24px;color:#1f2937;line-height:1.45}h1{text-align:center;color:#4f46e5}h2{text-align:center;color:#64748b;font-size:14px}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.box{border:1px solid #c7d2fe;background:#eef2ff;border-radius:12px;padding:12px}.item{break-inside:avoid;margin:14px 0;padding:14px;border:1px solid #e5e7eb;border-left:5px solid #6366f1;border-radius:12px;background:#fafafa}.item h3{margin:0 0 8px;color:#4338ca}.answer{margin-top:10px;color:#047857;font-size:13px;font-weight:bold}footer{margin-top:28px;text-align:center;color:#64748b;font-size:11px;border-top:1px solid #e5e7eb;padding-top:12px}@media print{body{padding:12px}.item{page-break-inside:avoid}}</style></head><body><h1>${data.title || meta.type}</h1><h2>${meta.subject} | ${meta.level} | ${meta.type}</h2><div class="meta"><div class="box">Nama: __________________</div><div class="box">Kelas: __________________</div><div class="box">Tarikh: _________________</div></div><div class="box"><strong>Arahan:</strong> ${data.instructions || 'Gunakan bahan ini semasa pembelajaran.'}</div>${items.map((item, i) => `<div class="item"><h3>${i + 1}. ${item.heading || 'Item'}</h3><div>${item.content || ''}</div>${item.answer ? `<div class="answer">Jawapan/Nota: ${item.answer}</div>` : ''}</div>`).join('')}<footer>CeriaKid Educational Platform | Malaysia</footer></body></html>`;
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
    const data = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Anda ialah guru pakar KSSR/DSKP Malaysia. Jana ${typeLabel} lengkap, berkualiti dan siap cetak A4 untuk ${subjectLabel} ${levelLabel}. Topik: ${topic || 'umum'}. Bilangan item/soalan: ${count}. Wajib ada objektif pembelajaran jelas, arahan murid yang mudah, kandungan selari tahap umur, soalan pelbagai aras mudah-sederhana, contoh tempatan Malaysia, jawapan/skema ringkas, tiada placeholder dan tiada fakta meragukan. DILARANG guna heading seperti "Soalan 1", "Item", "Gambar di bawah", atau arahan "lihat gambar" jika tiada imej sebenar. Setiap heading mesti menerangkan kemahiran khusus seperti "Kenal Pasti Kata Nama Am". Pulangkan JSON sahaja: title, description, instructions, items array dengan heading, content, answer.`,
      response_json_schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, instructions: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { heading: { type: 'string' }, content: { type: 'string' }, answer: { type: 'string' } } } } } },
    });

    const htmlContent = renderHtml(data, { subject: subjectLabel, level: levelLabel, type: typeLabel });
    const saved = await base44.asServiceRole.entities.BBMResource.create({ title: data.title || `${typeLabel} - ${subjectLabel} ${levelLabel}`, description: data.description || `Jana AI | ${topic || 'Umum'}`, subject, level, type, emoji, tier: 'free', downloadCount: 0, isPublished: Boolean(autoPublish), tags: [subjectLabel, levelLabel, topic || 'AI Generated', typeLabel], htmlContent });
    return Response.json({ success: true, bbmId: saved.id, title: saved.title, htmlContent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});