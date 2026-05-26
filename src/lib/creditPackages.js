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
    perks: ['~50 soalan AI / Kuiz', '~10 cerita kreatif', '~6 lembaran kerja BBM'],
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
    perks: ['125 kredit (110 + 15 bonus)', '~125 soalan AI / Kuiz', '~25 cerita · ~15 BBM'],
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
    perks: ['270 kredit (230 + 40 bonus)', '~270 soalan AI / Kuiz', '~54 cerita · ~33 BBM'],
  },
];

// Harga kredit setiap ciri AI (dikurangkan dari baki user)
export const CREDIT_COSTS = {
  ai_assistant: 1,        // 1 kredit per soalan (gpt-4o-mini)
  story_generator: 5,     // 5 kredit per cerita (gpt_5_4, margin ~13x)
  bbm_generator: 8,       // 8 kredit per BBM (gpt_5_4, margin ~13x)
  quiz_ai: 1,             // 1 kredit per soalan kuiz (gpt-4o-mini)
};

export function getPackageById(id) {
  return CREDIT_PACKAGES.find(p => p.id === id);
}