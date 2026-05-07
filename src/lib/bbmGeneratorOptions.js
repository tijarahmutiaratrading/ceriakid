export const GENERATION_MODES = [
  { id: 'quick', label: 'Quick Generate', emoji: '⚡', description: 'Generate pantas berdasarkan topik.' },
  { id: 'smart', label: 'Smart Generate', emoji: '🧠', description: 'AI ikut tahap, objektif dan masa kelas.' },
  { id: 'exam', label: 'Exam Mode', emoji: '🏆', description: 'UPSR/PT3/SPM style, KBAT dan skema.' },
  { id: 'game', label: 'Game Mode', emoji: '🎲', description: 'Aktiviti kelas, matching, escape, challenge.' },
  { id: 'presentation', label: 'Presentation Mode', emoji: '📊', description: 'Slides, infografik, timeline dan diagram.' },
];

export const SCHOOL_LEVELS = [
  { value: 'prasekolah', label: 'Prasekolah' },
  { value: 'darjah_1', label: 'Darjah 1' }, { value: 'darjah_2', label: 'Darjah 2' }, { value: 'darjah_3', label: 'Darjah 3' },
  { value: 'darjah_4', label: 'Darjah 4' }, { value: 'darjah_5', label: 'Darjah 5' }, { value: 'darjah_6', label: 'Darjah 6' },
];

export const SUBJECTS = [
  { value: 'bahasa_melayu', label: 'Bahasa Melayu', emoji: '🇲🇾' }, { value: 'english', label: 'English', emoji: '🇬🇧' },
  { value: 'mathematics', label: 'Matematik', emoji: '🔢' }, { value: 'science', label: 'Sains', emoji: '🔬' },
  { value: 'pendidikan_islam', label: 'Pendidikan Islam', emoji: '🌙' }, { value: 'jawi', label: 'Jawi', emoji: '🕌' },
  { value: 'sejarah', label: 'Sejarah', emoji: '🏛️' }, { value: 'rbt', label: 'RBT', emoji: '🛠️' },
];

export const BBM_TYPES = [
  { value: 'lembaran_kerja', label: 'Worksheet' }, { value: 'slaid_powerpoint', label: 'Slides' }, { value: 'kuiz', label: 'Kuiz Interaktif' },
  { value: 'kad_imbasan', label: 'Flashcard' }, { value: 'poster_pendidikan', label: 'Poster' }, { value: 'nota_ringkas', label: 'Nota Ringkas' },
  { value: 'infografik', label: 'Infografik' }, { value: 'latihan_pemahaman', label: 'Pemahaman' }, { value: 'aktiviti', label: 'Aktiviti Kelas' },
  { value: 'permainan_bilik_darjah', label: 'Game Pendidikan' }, { value: 'latihan_peperiksaan', label: 'Latihan Peperiksaan' },
  { value: 'bahan_pbd', label: 'Bahan PBD' }, { value: 'aktiviti_stem', label: 'Aktiviti STEM' }, { value: 'mind_map', label: 'Mind Map' },
  { value: 'latihan_kbat', label: 'Latihan KBAT' }, { value: 'roleplay', label: 'Roleplay' }, { value: 'eksperimen_sains', label: 'Eksperimen Sains' },
  { value: 'spelling_activity', label: 'Spelling Activity' }, { value: 'vocabulary_builder', label: 'Vocabulary Builder' },
  { value: 'karangan_builder', label: 'Karangan Builder' }, { value: 'rancangan_pengajaran', label: 'AI Lesson Plan' }, { value: 'teaching_kit', label: 'AI Teaching Kit' },
];

export const VISUAL_STYLES = [
  { id: 'canva', label: 'Canva Education', colors: ['#7C3AED', '#06B6D4', '#FDE68A'] },
  { id: 'twinkl', label: 'Twinkl Premium', colors: ['#2563EB', '#F97316', '#ECFCCB'] },
  { id: 'kahoot', label: 'Kahoot Bold', colors: ['#46178F', '#E21B3C', '#26890C'] },
  { id: 'genially', label: 'Genially Interactive', colors: ['#111827', '#8B5CF6', '#22D3EE'] },
  { id: 'pinterest', label: 'Pinterest Classroom', colors: ['#F472B6', '#A7F3D0', '#FEF3C7'] },
];

export const getLabel = (items, value) => items.find(item => item.value === value || item.id === value)?.label || value;
export const getSubjectEmoji = (value) => SUBJECTS.find(item => item.value === value)?.emoji || '📚';