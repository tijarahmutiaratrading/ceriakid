// Forest-themed AI illustrations for each mini game category.
// Shared across all games in a category to save credits and stay consistent.
export const CATEGORY_ILLUSTRATIONS = {
  memory_master: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/04b4526ab_generated_image.png',
  logic_puzzles: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/edb84b23b_generated_image.png',
  speed_focus: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8386273f2_generated_image.png',
  pattern_genius: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/bc27e6135_generated_image.png',
  maze_adventure: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a2a95cd79_generated_image.png',
  creative_builder: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/83976cce2_generated_image.png',
  problem_solver: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/850cc012a_generated_image.png',
  brain_training: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/831cba3e7_generated_image.png',
};

export function getCategoryIllustration(categoryId) {
  return CATEGORY_ILLUSTRATIONS[categoryId] || null;
}