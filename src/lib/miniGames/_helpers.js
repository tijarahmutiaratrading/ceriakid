// Helper untuk hand-crafted mini games — assign difficulty escalating ke setiap round.
// Round 1-3 = Mudah, 4-7 = Sederhana, 8-10 = Sukar.
// Field round data (pairs/items/target/dll) di-spread ke top level supaya
// MiniGameModeRenderer boleh baca terus tanpa perlu drill ke `.data`.

export function makeRounds(rawRounds) {
  return (rawRounds || []).map((data, idx) => {
    const roundNumber = idx + 1;
    let difficulty = 'easy';
    let difficultyLabel = 'Mudah';
    if (roundNumber >= 8) {
      difficulty = 'hard';
      difficultyLabel = 'Sukar';
    } else if (roundNumber >= 4) {
      difficulty = 'medium';
      difficultyLabel = 'Sederhana';
    }
    return {
      round: roundNumber,
      difficulty,
      difficultyLabel,
      label: `Pusingan ${roundNumber} · ${difficultyLabel}`,
      ...(data || {}),
    };
  });
}