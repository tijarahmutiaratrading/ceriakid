// Pixar-style child avatars — kongsi guna seluruh app supaya konsisten
export const CHILD_AVATARS = [
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3df7477bd_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a716e8427_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/cc2c8d491_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8a9bbc813_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1255ecf00_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/208266350_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fcff737ee_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/980a2e0ce_generated_image.png',
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