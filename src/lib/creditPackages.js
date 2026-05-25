// Pakej kredit AI yang dijual kepada parents.
// Edit di sini untuk tukar harga/bonus.
// price dalam MYR sen (cth: 1000 = RM10.00)

export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Pek Permulaan',
    credits: 50,
    bonusCredits: 0,
    price: 1900, // RM19
    emoji: '🌱',
    color: 'from-emerald-400 to-green-500',
    description: 'Sesuai untuk cuba ciri AI',
    perks: ['~50 soalan AI', '~6 cerita kreatif', '~3 lembaran kerja'],
  },
  {
    id: 'family',
    name: 'Pek Keluarga',
    credits: 110,
    bonusCredits: 15,
    price: 5900, // RM59
    emoji: '⭐',
    color: 'from-sky-400 to-blue-500',
    description: 'Paling popular — jimat 22%',
    popular: true,
    perks: ['125 kredit (110 + 15 bonus)', 'Untuk 2-3 anak', 'Tahan ~1 bulan'],
  },
  {
    id: 'power',
    name: 'Pek Power',
    credits: 230,
    bonusCredits: 40,
    price: 14900, // RM149
    emoji: '👑',
    color: 'from-violet-400 to-purple-500',
    description: 'Nilai terbaik — jimat 38%',
    perks: ['270 kredit (230 + 40 bonus)', 'Untuk keluarga besar', 'Tahan ~3 bulan'],
  },
];

// Harga kredit setiap ciri AI (dikurangkan dari baki user)
export const CREDIT_COSTS = {
  ai_assistant: 1,        // 1 kredit per soalan
  story_generator: 8,     // 8 kredit per cerita (model gpt_5_4 mahal)
  bbm_generator: 15,      // 15 kredit per BBM (model gpt_5_4 + content panjang)
  quiz_ai: 1,             // 1 kredit per soalan kuiz
};

export function getPackageById(id) {
  return CREDIT_PACKAGES.find(p => p.id === id);
}