// Konfigurasi subjek & tahap untuk Library Hub (nota silibus KSSR + 3M).
export const NOTE_SUBJECTS = [
  { id: 'bahasa_melayu', label: 'Bahasa Melayu', emoji: '📕', gradient: 'from-red-400 to-rose-500' },
  { id: 'english', label: 'English', emoji: '📗', gradient: 'from-emerald-400 to-green-500' },
  { id: 'mathematics', label: 'Matematik', emoji: '🔢', gradient: 'from-blue-400 to-indigo-500' },
  { id: 'science', label: 'Sains', emoji: '🔬', gradient: 'from-cyan-400 to-teal-500' },
  { id: 'jawi', label: 'Jawi', emoji: '🕌', gradient: 'from-amber-400 to-orange-500' },
  { id: 'pendidikan_islam', label: 'Pendidikan Islam', emoji: '☪️', gradient: 'from-green-400 to-emerald-600' },
  { id: 'pendidikan_moral', label: 'Pendidikan Moral', emoji: '🤝', gradient: 'from-pink-400 to-rose-500' },
  { id: 'sejarah', label: 'Sejarah', emoji: '📜', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'rbt', label: 'Reka Bentuk (RBT)', emoji: '🔧', gradient: 'from-slate-400 to-slate-600' },
  { id: 'pjk', label: 'PJK', emoji: '⚽', gradient: 'from-orange-400 to-red-500' },
  { id: 'seni', label: 'Seni Visual', emoji: '🎨', gradient: 'from-fuchsia-400 to-purple-500' },
  { id: '3m_membaca', label: '3M Membaca', emoji: '📖', gradient: 'from-purple-400 to-violet-500' },
  { id: '3m_menulis', label: '3M Menulis', emoji: '✍️', gradient: 'from-indigo-400 to-blue-500' },
  { id: '3m_mengira', label: '3M Mengira', emoji: '🧮', gradient: 'from-teal-400 to-cyan-500' },
];

export const NOTE_LEVELS = [
  { id: 'prasekolah', label: 'Prasekolah', short: 'Pra' },
  { id: 'darjah_1', label: 'Darjah 1', short: 'D1' },
  { id: 'darjah_2', label: 'Darjah 2', short: 'D2' },
  { id: 'darjah_3', label: 'Darjah 3', short: 'D3' },
  { id: 'darjah_4', label: 'Darjah 4', short: 'D4' },
  { id: 'darjah_5', label: 'Darjah 5', short: 'D5' },
  { id: 'darjah_6', label: 'Darjah 6', short: 'D6' },
];

// Peta nama warna -> kelas Tailwind (literal supaya tak di-purge).
export const NOTE_COLORS = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-200', solid: 'bg-purple-500', grad: 'from-purple-400 to-purple-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', ring: 'ring-pink-200', solid: 'bg-pink-500', grad: 'from-pink-400 to-pink-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200', solid: 'bg-blue-500', grad: 'from-blue-400 to-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-200', solid: 'bg-green-500', grad: 'from-green-400 to-green-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-200', solid: 'bg-orange-500', grad: 'from-orange-400 to-orange-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-200', solid: 'bg-yellow-500', grad: 'from-yellow-400 to-yellow-600' },
  red: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200', solid: 'bg-red-500', grad: 'from-red-400 to-red-600' },
};

export const getNoteColor = (name) => NOTE_COLORS[name] || NOTE_COLORS.purple;
export const getSubjectMeta = (id) => NOTE_SUBJECTS.find((s) => s.id === id);
export const getLevelMeta = (id) => NOTE_LEVELS.find((l) => l.id === id);