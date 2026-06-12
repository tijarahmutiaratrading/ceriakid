// Token nilai murni yang dikutip dalam arcade games
export const VALUE_TOKENS = [
  { emoji: '⭐', name: 'Jujur', message: 'Kejujuran membuatkan kita dipercayai semua orang!' },
  { emoji: '❤️', name: 'Baik Hati', message: 'Berbuat baik buat hati kita gembira!' },
  { emoji: '🤝', name: 'Tolong-Menolong', message: 'Tolong kawan bila mereka susah, ya!' },
  { emoji: '📖', name: 'Rajin Belajar', message: 'Rajin belajar buat kita semakin pandai!' },
  { emoji: '🙏', name: 'Hormat', message: 'Hormati ibu bapa dan cikgu setiap hari!' },
  { emoji: '😊', name: 'Sabar', message: 'Orang yang sabar sentiasa tenang dan hebat!' },
];

export const randomToken = () => VALUE_TOKENS[Math.floor(Math.random() * VALUE_TOKENS.length)];

export const getBest = (key) => Number(localStorage.getItem(`arcade_best_${key}`) || 0);
export const saveBest = (key, score) => {
  const best = getBest(key);
  if (score > best) localStorage.setItem(`arcade_best_${key}`, String(score));
  return Math.max(best, score);
};