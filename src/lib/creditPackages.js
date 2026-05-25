// Pakej kredit AI yang dijual kepada parents.
// Edit di sini untuk tukar harga/bonus.
// price dalam MYR sen (cth: 1000 = RM10.00)

export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Pek Permulaan',
    credits: 50,
    bonusCredits: 0,
    price: 1000, // RM10
    emoji: '🌱',
    color: 'from-emerald-400 to-green-500',
    description: 'Sesuai untuk cuba ciri AI',
    perks: ['~50 soalan AI', '~10 cerita kreatif', '~5 lembaran kerja'],
  },
  {
    id: 'family',
    name: 'Pek Keluarga',
    credits: 150,
    bonusCredits: 30,
    price: 2500, // RM25
    emoji: '⭐',
    color: 'from-sky-400 to-blue-500',
    description: 'Paling popular — jimat 20%',
    popular: true,
    perks: ['180 kredit (150 + 30 bonus)', 'Untuk 2-3 anak', 'Tahan ~1 bulan'],
  },
  {
    id: 'power',
    name: 'Pek Power',
    credits: 500,
    bonusCredits: 150,
    price: 7500, // RM75
    emoji: '👑',
    color: 'from-violet-400 to-purple-500',
    description: 'Nilai terbaik — jimat 35%',
    perks: ['650 kredit (500 + 150 bonus)', 'Untuk keluarga besar', 'Tahan ~3 bulan'],
  },
];

// Harga kredit setiap ciri AI (dikurangkan dari baki user)
export const CREDIT_COSTS = {
  ai_assistant: 1,        // 1 kredit per soalan
  story_generator: 5,     // 5 kredit per cerita
  bbm_generator: 10,      // 10 kredit per BBM
};

export function getPackageById(id) {
  return CREDIT_PACKAGES.find(p => p.id === id);
}