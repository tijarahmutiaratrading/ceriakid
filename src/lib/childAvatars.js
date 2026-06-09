// Pixar-style child avatars — kongsi guna seluruh app supaya konsisten
export const CHILD_AVATARS = [
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/879177e93_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4a9ccff0c_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dbe708f86_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/859709ce1_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a7f6702d9_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ac896fb01_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7aff2307a_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c6be5434d_generated_image.png',
];

/**
 * Returns the child's uploaded avatar, or a deterministic pixar avatar fallback
 * based on child id/name (so the same child always gets the same fallback).
 */
export function getChildAvatar(child) {
  if (!child) return CHILD_AVATARS[0];
  if (child.avatarUrl) return child.avatarUrl;
  const key = String(child.id ?? child.name ?? '');
  const hash = key.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CHILD_AVATARS[hash % CHILD_AVATARS.length];
}