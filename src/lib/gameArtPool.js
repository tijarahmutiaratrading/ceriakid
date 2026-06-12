// Pool art Pixar 3D untuk game cards — dirotasi ikut index supaya setiap game nampak unik
export const GAME_ART_POOL = [
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6b7d784b0_generated_image.png', accent: '#a855f7' }, // quiz stage
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fb8fbfcf4_generated_image.png', accent: '#ec4899' }, // memory cards
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f4f5426bd_generated_image.png', accent: '#3b82f6' }, // counting blocks
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d53c95af8_generated_image.png', accent: '#f97316' }, // alphabet blocks
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/33f6642d0_generated_image.png', accent: '#10b981' }, // science lab
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/41b5c6b76_generated_image.png', accent: '#8b5cf6' }, // puzzle clouds
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c596a927b_generated_image.png', accent: '#f59e0b' }, // treasure island
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/00ed36e73_generated_image.png', accent: '#6366f1' }, // space classroom
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/58ed55587_generated_image.png', accent: '#22c55e' }, // jungle trail
  { art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6e464a293_generated_image.png', accent: '#06b6d4' }, // underwater letters
];

export const getGameArt = (idx) => GAME_ART_POOL[Math.abs(idx) % GAME_ART_POOL.length];