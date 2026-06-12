// Art Pixar 3D sinematik per subjek — dikongsi antara Library Hub & senarai games subjek
export const SUBJECT_CINEMATIC_ART = {
  bahasa_melayu:    'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/be21bf850_generated_image.png',
  english:          'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/826d26090_generated_image.png',
  mathematics:      'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e51d9e39b_generated_image.png',
  science:          'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3ee173577_generated_image.png',
  jawi:             'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f37ef98f5_generated_image.png',
  pendidikan_islam: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b426bdcf0_generated_image.png',
  pendidikan_moral: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/beb7d1de4_generated_image.png',
  sejarah:          'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/90072f0d5_generated_image.png',
  rbt:              'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/71d8ab133_generated_image.png',
  pjk:              'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7a4546dcc_generated_image.png',
  seni:             'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ed4344389_generated_image.png',
  worksheet:        'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/5e14e4531_generated_image.png',
  bahasa_tamil:     'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1dac8b0f4_generated_image.png',
  bahasa_mandarin:  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/477e24964_generated_image.png',
  kafa:             'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/03379754a_generated_image.png',
};

export const SUBJECT_CINEMATIC_ACCENT = {
  bahasa_melayu: '#ef4444', english: '#22c55e', mathematics: '#6366f1',
  science: '#06b6d4', jawi: '#f59e0b', pendidikan_islam: '#10b981', pendidikan_moral: '#ec4899',
  sejarah: '#d97706', rbt: '#64748b', pjk: '#f97316', seni: '#a855f7',
  worksheet: '#8b5cf6', bahasa_tamil: '#e11d48', bahasa_mandarin: '#dc2626', kafa: '#10b981',
};

export const getSubjectArt = (cat) =>
  SUBJECT_CINEMATIC_ART[cat] || (cat?.startsWith('kafa_') ? SUBJECT_CINEMATIC_ART.kafa : null);

export const getSubjectAccent = (cat) =>
  SUBJECT_CINEMATIC_ACCENT[cat] || (cat?.startsWith('kafa_') ? SUBJECT_CINEMATIC_ACCENT.kafa : '#8b5cf6');