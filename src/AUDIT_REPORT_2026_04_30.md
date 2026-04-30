# CeriaJaya Content Audit Report - 2026-04-30

## AUDIT STATUS: **CRITICAL - INSUFFICIENT CONTENT**

### Target Requirements:
- ✅ Minimum: 20 games per subject
- ✅ Minimum: 20 unique questions per game

---

## PRASEKOLAH AUDIT

### Bahasa Melayu
- **Files Merged**: gameData_prasekolah_bm.js + bm_expansion.js + bm_expansion_full.js
- **Games Count**: ~35 games ✅ (MEETS TARGET)
- **Questions Status**: 
  - Original: 8 questions/game ❌
  - Expansion: 10 questions/game ❌
  - Expansion Full: 20 questions/game ✅
  - **Result**: MIXED - 5 games have 20+ soalan, rest have 8-10

### English
- **Files Merged**: gameData_prasekolah_en.js + en_expansion.js + en_expansion_full.js
- **Games Count**: ~35 games ✅ (MEETS TARGET)
- **Questions Status**: 
  - Original: 8 questions/game ❌
  - Expansion: 8 questions/game ❌
  - Expansion Full: 20 questions/game ✅
  - **Result**: MIXED - 5 games have 20+ soalan, rest have 8

### Mathematics
- **Files Merged**: gameData_prasekolah_math.js + math_expansion.js
- **Games Count**: ~20 games ✅ (MEETS TARGET MINIMALLY)
- **Questions Status**: 
  - Most games: 20-40 questions ✅
  - **Result**: GOOD - Most meet 20+ requirement

### Science
- **Files Merged**: gameData_prasekolah_science.js + science_expansion.js
- **Games Count**: ~20 games ✅ (MEETS TARGET)
- **Questions Status**: 
  - Most games: 8-40 questions (MIXED)
  - **Result**: PARTIAL - Need standardization

### Tamil
- **Games Count**: 20 games ✅
- **Questions Status**: 8-17 questions/game ❌
- **Result**: NEEDS EXPANSION

### Mandarin
- **Games Count**: 20 games ✅
- **Questions Status**: 8-20 questions/game (MIXED)
- **Result**: PARTIAL - Some need expansion

---

## SEKOLAH RENDAH AUDIT

### Bahasa Melayu
- **Games Count**: ~20 games ✅
- **Questions Status**: 8 questions/game ❌
- **Result**: CRITICAL - All need expansion to 20+

### Jawi
- **Games Count**: ~20 games ✅
- **Questions Status**: 8 questions/game ❌
- **Result**: CRITICAL - All need expansion to 20+

### English
- **Games Count**: ~24 games ✅
- **Questions Status**: 8 questions/game ❌
- **Result**: CRITICAL - All need expansion to 20+

### Mathematics
- **Files Merged**: gameData_sr_math.js + sr_math_expansion.js
- **Games Count**: 26 games ✅
- **Questions Status**: 8-20 questions/game (MIXED)
- **Result**: GOOD - Most meet requirement

### Science
- **Games Count**: ~18 games ❌ (BELOW 20)
- **Questions Status**: 8 questions/game ❌
- **Result**: CRITICAL - Need more games AND more questions

### Tamil
- **Games Count**: 28 games ✅
- **Questions Status**: 8-10 questions/game ❌
- **Result**: CRITICAL - All need expansion to 20+

### Mandarin
- **Games Count**: 30 games ✅
- **Questions Status**: 8 questions/game ❌
- **Result**: CRITICAL - All need expansion to 20+

---

## PRIORITY ACTION ITEMS

### TIER 1 - CRITICAL (Must fix immediately):
1. **SR Bahasa Melayu** - Expand all 20 games to 20+ questions each
2. **SR Jawi** - Expand all 20 games to 20+ questions each
3. **SR English** - Expand all 24 games to 20+ questions each
4. **SR Tamil** - Expand all 28 games to 20+ questions each
5. **SR Mandarin** - Expand all 30 games to 20+ questions each
6. **SR Science** - Add 2+ new games AND expand to 20+ questions

### TIER 2 - HIGH (Complete expansion):
1. **Prasekolah BM** - Expand remaining 30 games (only 5 have 20+ now)
2. **Prasekolah English** - Expand remaining 30 games (only 5 have 20+ now)
3. **Prasekolah Tamil** - Expand all 20 games to 20+ questions
4. **Prasekolah Mandarin** - Expand games that have <20 questions
5. **Prasekolah Science** - Standardize & expand to 20+ questions per game

### TIER 3 - MEDIUM (Verify & finalize):
1. **Prasekolah Mathematics** - Verify all games have 20+ questions
2. **Prasekolah Science** - Add more questions to reach 20+ uniformly
3. **SR Mathematics** - Verify all games have 20+ questions

---

## SUMMARY TABLE

| Subject | Age Group | Games | Status | Questions | Status |
|---------|-----------|-------|--------|-----------|--------|
| Bahasa Melayu | Prasekolah | 35 | ✅ | Mixed | ⚠️ |
| English | Prasekolah | 35 | ✅ | Mixed | ⚠️ |
| Mathematics | Prasekolah | 20 | ✅ | Good | ✅ |
| Science | Prasekolah | 20 | ✅ | Mixed | ⚠️ |
| Tamil | Prasekolah | 20 | ✅ | Low | ❌ |
| Mandarin | Prasekolah | 20 | ✅ | Mixed | ⚠️ |
| **Bahasa Melayu** | **SR** | **20** | **✅** | **Low** | **❌** |
| **Jawi** | **SR** | **20** | **✅** | **Low** | **❌** |
| **English** | **SR** | **24** | **✅** | **Low** | **❌** |
| **Mathematics** | **SR** | **26** | **✅** | **Good** | **✅** |
| **Science** | **SR** | **18** | **❌** | **Low** | **❌** |
| **Tamil** | **SR** | **28** | **✅** | **Low** | **❌** |
| **Mandarin** | **SR** | **30** | **✅** | **Low** | **❌** |

---

## NEXT STEPS

1. Start with SR subjects (Tier 1) - they affect most students
2. Create expansion_full files for each low-content subject
3. Ensure at least 20 unique questions per game minimum
4. Update gameLibrary.js to include all expansion files
5. Re-audit after each batch to confirm compliance

**Estimated work**: 15-20 expansion files needed (each ~5-10 games with 20+ questions)