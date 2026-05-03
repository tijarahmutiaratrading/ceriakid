import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const { subject, level, type, topic, count = 10 } = await req.json();

  const subjectLabels = {
    bahasa_melayu: 'Bahasa Melayu',
    english: 'English',
    mathematics: 'Matematik',
    science: 'Sains',
    jawi: 'Jawi',
    pendidikan_islam: 'Pendidikan Islam',
    pendidikan_moral: 'Pendidikan Moral',
    sejarah: 'Sejarah',
  };

  const levelLabels = {
    prasekolah: 'Prasekolah (Umur 5-6)',
    darjah_1: 'Darjah 1',
    darjah_2: 'Darjah 2',
    darjah_3: 'Darjah 3',
    darjah_4: 'Darjah 4',
    darjah_5: 'Darjah 5',
    darjah_6: 'Darjah 6',
  };

  const subjectLabel = subjectLabels[subject] || subject;
  const levelLabel = levelLabels[level] || level;

  let prompt = '';

  if (type === 'lembaran_kerja') {
    prompt = `Kau adalah cikgu Malaysia berpengalaman. Jana lembaran kerja (worksheet) untuk murid ${levelLabel} subjek ${subjectLabel}.
Topik: ${topic || 'topik umum sesuai untuk tahap ini'}
Bilangan soalan: ${count}

Hasilkan dalam format JSON:
{
  "title": "tajuk lembaran kerja",
  "subtitle": "subjek dan tahap",
  "instructions": "arahan untuk murid",
  "questions": [
    {
      "no": 1,
      "type": "isi_tempat_kosong | soalan_pendek | padankan | betul_salah | pilihan_jawapan",
      "question": "soalan",
      "options": ["A", "B", "C", "D"] (jika pilihan_jawapan),
      "answer": "jawapan",
      "marks": 1
    }
  ]
}

Pastikan soalan sesuai dengan tahap KSSR Malaysia, bahasa formal, dan tepat dari segi akademik.`;
  } else if (type === 'kuiz') {
    prompt = `Kau adalah cikgu Malaysia berpengalaman. Jana set kuiz untuk murid ${levelLabel} subjek ${subjectLabel}.
Topik: ${topic || 'topik umum sesuai untuk tahap ini'}
Bilangan soalan: ${count} soalan objektif (pilihan berganda)

Hasilkan dalam format JSON:
{
  "title": "tajuk kuiz",
  "subtitle": "subjek dan tahap",
  "duration": "masa yang dicadangkan (contoh: 20 minit)",
  "questions": [
    {
      "no": 1,
      "question": "soalan",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A/B/C/D",
      "explanation": "penjelasan ringkas kenapa jawapan ini betul"
    }
  ]
}

Pastikan soalan sesuai KSSR, aras kesukaran seimbang (mudah/sederhana/susah), dan tepat.`;
  } else if (type === 'rancangan_pengajaran') {
    prompt = `Kau adalah cikgu Malaysia berpengalaman. Jana Rancangan Pengajaran Harian (RPH) untuk ${levelLabel} subjek ${subjectLabel}.
Topik: ${topic || 'topik umum sesuai untuk tahap ini'}

Hasilkan dalam format JSON:
{
  "title": "tajuk RPH",
  "subject": "${subjectLabel}",
  "level": "${levelLabel}",
  "duration": "60 minit",
  "objectives": ["objektif 1", "objektif 2", "objektif 3"],
  "materials": ["bahan 1", "bahan 2"],
  "phases": [
    {
      "name": "Set Induksi (5 minit)",
      "activities": ["aktiviti 1", "aktiviti 2"],
      "notes": "catatan cikgu"
    },
    {
      "name": "Perkembangan (40 minit)",
      "activities": ["aktiviti 1", "aktiviti 2", "aktiviti 3"],
      "notes": "catatan cikgu"
    },
    {
      "name": "Penutup (15 minit)",
      "activities": ["aktiviti 1", "aktiviti 2"],
      "notes": "catatan cikgu"
    }
  ],
  "assessment": "kaedah penilaian",
  "moral_values": ["nilai murni 1", "nilai murni 2"]
}`;
  } else {
    return Response.json({ error: 'Jenis BBM tidak disokong untuk jana AI' }, { status: 400 });
  }

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      additionalProperties: true,
    },
  });

  // Generate HTML content for display/print
  let htmlContent = '';

  if (type === 'lembaran_kerja' || type === 'kuiz') {
    const data = result;
    htmlContent = `
<!DOCTYPE html>
<html lang="ms">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
  h1 { text-align: center; color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
  h2 { text-align: center; color: #666; font-size: 14px; margin-top: 4px; }
  .info { display: flex; justify-content: space-between; margin: 20px 0; border: 1px solid #ddd; padding: 10px; border-radius: 8px; }
  .question { margin: 16px 0; padding: 12px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #4f46e5; }
  .question-no { font-weight: bold; color: #4f46e5; }
  .options { margin-top: 8px; margin-left: 20px; }
  .answer-box { margin-top: 30px; border-top: 2px dashed #ccc; padding-top: 20px; }
  .answer-item { display: inline-block; margin: 4px 12px; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
<h1>${data.title || 'Lembaran Kerja'}</h1>
<h2>${data.subtitle || `${subjectLabel} | ${levelLabel}`}</h2>
<div class="info">
  <div>Nama: _______________________</div>
  <div>Kelas: _______________________</div>
  <div>Tarikh: _______________________</div>
</div>
<p><strong>Arahan:</strong> ${data.instructions || 'Jawab semua soalan berikut.'}</p>
${(data.questions || []).map(q => `
<div class="question">
  <span class="question-no">${q.no}.</span> ${q.question}
  ${q.options ? `<div class="options">${q.options.map(o => `<div>( ) ${o}</div>`).join('')}</div>` : ''}
  ${type === 'lembaran_kerja' && q.type === 'isi_tempat_kosong' ? '<div style="margin-top:8px">Jawapan: ___________________</div>' : ''}
  ${q.explanation ? `<div style="margin-top:6px;font-size:12px;color:#666;font-style:italic">💡 ${q.explanation}</div>` : ''}
</div>`).join('')}
<div class="answer-box">
  <strong>Skema Jawapan:</strong><br>
  ${(data.questions || []).map(q => `<span class="answer-item">${q.no}. ${q.answer}</span>`).join('')}
</div>
</body></html>`;
  } else if (type === 'rancangan_pengajaran') {
    const data = result;
    htmlContent = `
<!DOCTYPE html>
<html lang="ms">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
  h1 { text-align: center; color: #4f46e5; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #4f46e5; color: white; padding: 8px; text-align: left; }
  td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
  tr:nth-child(even) { background: #f9f9f9; }
  .phase { background: #e0e7ff; font-weight: bold; }
  ul { margin: 4px 0; padding-left: 20px; }
</style>
</head>
<body>
<h1>Rancangan Pengajaran Harian</h1>
<table>
  <tr><td><strong>Subjek</strong></td><td>${data.subject || subjectLabel}</td><td><strong>Tahun/Darjah</strong></td><td>${data.level || levelLabel}</td></tr>
  <tr><td><strong>Tajuk</strong></td><td colspan="3">${data.title || topic}</td></tr>
  <tr><td><strong>Masa</strong></td><td>${data.duration || '60 minit'}</td><td><strong>Nilai Murni</strong></td><td>${(data.moral_values || []).join(', ')}</td></tr>
</table>
<p><strong>Objektif Pembelajaran:</strong></p>
<ul>${(data.objectives || []).map(o => `<li>${o}</li>`).join('')}</ul>
<p><strong>Bahan Bantu Mengajar:</strong></p>
<ul>${(data.materials || []).map(m => `<li>${m}</li>`).join('')}</ul>
<table>
  <tr><th>Fasa</th><th>Aktiviti</th><th>Catatan</th></tr>
  ${(data.phases || []).map(p => `<tr><td class="phase">${p.name}</td><td><ul>${(p.activities || []).map(a => `<li>${a}</li>`).join('')}</ul></td><td>${p.notes || ''}</td></tr>`).join('')}
</table>
<p><strong>Penilaian:</strong> ${data.assessment || ''}</p>
</body></html>`;
  }

  // Save to BBMResource entity
  const saved = await base44.asServiceRole.entities.BBMResource.create({
    title: result.title || `${type} - ${subjectLabel} ${levelLabel}`,
    description: `Jana secara AI | Topik: ${topic || 'Umum'}`,
    subject,
    level,
    type,
    emoji: type === 'kuiz' ? '🧩' : type === 'rancangan_pengajaran' ? '📝' : '📄',
    tier: 'free',
    downloadCount: 0,
    isPublished: false, // admin review before publish
    tags: [subjectLabel, levelLabel, topic || 'AI Generated'],
    // Store HTML in description since no file upload here
    previewImageUrl: '',
  });

  return Response.json({
    success: true,
    bbmId: saved.id,
    title: result.title,
    htmlContent,
    data: result,
  });
});