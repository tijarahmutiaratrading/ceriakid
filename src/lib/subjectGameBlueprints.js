// Central registry untuk hand-crafted subject games.
// Untuk seed ke DB dan replace AI-generated content yang quality rendah.

import { prasekolahBMGames } from './subjectGames/prasekolahBM.js';
import { prasekolahMathGames } from './subjectGames/prasekolahMath.js';
import { buildGameRecord, validateBlueprint } from './subjectGames/_helpers.js';

// All hand-crafted subject blueprints (Phase 1).
export const SUBJECT_BLUEPRINTS = [
  ...prasekolahBMGames,
  ...prasekolahMathGames,
];

// Helper: get blueprints by subject/age/darjah
export function getBlueprintsByFilter({ subject, ageGroup, darjah } = {}) {
  return SUBJECT_BLUEPRINTS.filter(bp => {
    if (subject && bp.subject !== subject) return false;
    if (ageGroup && bp.ageGroup !== ageGroup) return false;
    if (darjah !== undefined && bp.darjah !== darjah) return false;
    return true;
  });
}

// Helper: validate all blueprints (run at build time)
export function validateAllBlueprints() {
  const results = SUBJECT_BLUEPRINTS.map(bp => ({
    id: bp.id,
    title: bp.title,
    errors: validateBlueprint(bp),
  }));
  return {
    total: results.length,
    passed: results.filter(r => r.errors.length === 0).length,
    failed: results.filter(r => r.errors.length > 0),
  };
}

export { buildGameRecord };