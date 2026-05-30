# 📝 Stub Functions — Admin Generators & QC Tools

Functions berikut adalah **stubs** — return helpful message dan tidak melaksanakan logic generation/QC secara penuh.

## Kenapa stub?

Functions ini guna **Base44 InvokeLLM** dengan custom prompts yang sangat besar (50-500 lines per file) untuk generate game content. Translation penuh ke OpenAI memerlukan:

1. **Prompt engineering ulang** — Base44 model behavior (`gpt_5_5`, `gpt_5_4`) berbeza sedikit dari OpenAI standard
2. **Schema mapping** — Setiap generator ada response schema custom
3. **Background task management** — Base44 ada infrastructure untuk long-running tasks; Supabase Edge Functions ada timeout 150s

## Status

Stub functions return `200 OK` dengan message "Not implemented in Supabase backup. Use Base44 dashboard atau translate manually."

Untuk **disaster recovery purposes**, stub ini cukup — sebab:
- ✅ Semua existing games dah ada dalam `ck_games` table (sync)
- ✅ User boleh main games existing
- ✅ Admin tak perlu generate game baru semasa downtime
- ✅ QC boleh delay sampai Base44 up balik

## Untuk Translate Penuh (Future)

Kalau nanti nak buat full translation:

1. Baca source file di `functions/<name>` (Base44)
2. Salin prompt dari source
3. Replace `base44.integrations.Core.InvokeLLM({...})` dengan `invokeLLM({...})` dari `_shared/llm.ts`
4. Replace `base44.entities.X.create(data)` dengan `supabaseAdmin.from('ck_x').insert(data)`
5. Untuk task > 150s, split into smaller chunks atau guna Supabase pg_cron

## Stub Functions List (24)

### Game Generators (10)
- `launch-generate-batch`
- `launch-generate-story-kid`
- `launch-purge-bucket`
- `launch-get-progress`
- `launch-get-story-progress`
- `launch-get-mini-games-progress`
- `generate-all-kafa`
- `background-launch-generator`
- `background-story-generator`
- `regenerate-story-kid-images`

### Quality Control (8)
- `audit-all-games`
- `audit-story-kid-games`
- `audit-quiz-answers`
- `repair-all-games`
- `restore-quiz-answers-from-description`
- `get-qc-overview-report`
- `update-quality-control-settings`
- `normalize-kssr-buckets`

### Misc Admin Tools (6)
- `delete-mini-games`
- `delete-story-kid-games`
- `get-game-manager-counts`
- `get-worker-activity`
- `get-background-activity-status