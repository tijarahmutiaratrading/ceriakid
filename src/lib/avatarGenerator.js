// Default cartoon avatars by gender
const maleAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=boy1&backgroundColor=FFD700',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=boy2&backgroundColor=87CEEB',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=boy3&backgroundColor=90EE90',
];

const femaleAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=girl1&backgroundColor=FFB6C1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=girl2&backgroundColor=DDA0DD',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=girl3&backgroundColor=F0E68C',
];

export function getDefaultAvatar(name, gender = null) {
  // Simple hash based on name to pick consistent avatar
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // If gender is provided, use gender-specific avatars
  if (gender === 'male' || gender === 'boy') {
    return maleAvatars[hash % maleAvatars.length];
  } else if (gender === 'female' || gender === 'girl') {
    return femaleAvatars[hash % femaleAvatars.length];
  }
  
  // Default: pick from all avatars
  const allAvatars = [...maleAvatars, ...femaleAvatars];
  return allAvatars[hash % allAvatars.length];
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}