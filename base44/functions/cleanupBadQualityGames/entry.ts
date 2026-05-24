import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'jawi';
    const limit = body.limit || 50;

    const report = { action, deleted: 0, fixed: 0, remaining: 0 };

    // ACTION: jawi → hapus semua Jawi sekolah_rendah (batch)
    if (action === 'jawi') {
      const jawiGames = await base44.asServiceRole.entities.Game.filter({
        ageGroup: 'sekolah_rendah',
        category: 'jawi',
      });
      const batch = jawiGames.slice(0, limit);
      for (const g of batch) {
        await base44.asServiceRole.entities.Game.delete(g.id);
        report.deleted++;
      }
      report.remaining = jawiGames.length - batch.length;
    }

    // ACTION: bad_math → hapus Math Darjah 1 Pendaraban yang teruk
    else if (action === 'bad_math') {
      const mathGames = await base44.asServiceRole.entities.Game.filter({
        ageGroup: 'sekolah_rendah',
        category: 'mathematics',
        darjah: 'darjah_1',
      });
      for (const g of mathGames) {
        if (!g.title || !g.title.includes('Pendaraban 2')) continue;
        const questions = g.gameData?.questions || [];
        if (questions.length === 0) continue;
        const answerCounts = {};
        questions.forEach(q => {
          answerCounts[q.answer] = (answerCounts[q.answer] || 0) + 1;
        });
        const maxSame = Math.max(...Object.values(answerCounts));
        if (maxSame / questions.length >= 0.7) {
          await base44.asServiceRole.entities.Game.delete(g.id);
          report.deleted++;
        }
      }
    }

    // ACTION: duplicates → hapus duplicate titles dalam bucket sama
    else if (action === 'duplicates') {
      const allGames = await base44.asServiceRole.entities.Game.filter({
        ageGroup: 'sekolah_rendah',
        isPublished: true,
      });
      const bucketMap = {};
      for (const g of allGames) {
        const key = `${g.darjah}/${g.category}/${(g.title || '').toLowerCase().trim()}`;
        if (!bucketMap[key]) bucketMap[key] = [];
        bucketMap[key].push(g);
      }
      let deletedCount = 0;
      for (const key in bucketMap) {
        const dups = bucketMap[key];
        if (dups.length > 1) {
          dups.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          for (let i = 1; i < dups.length; i++) {
            if (deletedCount >= limit) break;
            await base44.asServiceRole.entities.Game.delete(dups[i].id);
            deletedCount++;
          }
        }
        if (deletedCount >= limit) break;
      }
      report.deleted = deletedCount;
    }

    // ACTION: fix_otto → fix typo "Otto" → "Otot" dalam Science
    else if (action === 'fix_otto') {
      const scienceGames = await base44.asServiceRole.entities.Game.filter({
        ageGroup: 'sekolah_rendah',
        category: 'science',
      });
      for (const g of scienceGames) {
        const questions = g.gameData?.questions || [];
        let modified = false;
        const fixedQuestions = questions.map(q => {
          const opts = q.options || [];
          const newOpts = opts.map(opt => {
            if (typeof opt === 'string' && opt === 'Otto') {
              modified = true;
              return 'Otot';
            }
            return opt;
          });
          return { ...q, options: newOpts };
        });
        if (modified) {
          await base44.asServiceRole.entities.Game.update(g.id, {
            gameData: { ...g.gameData, questions: fixedQuestions },
          });
          report.fixed++;
        }
      }
    }

    return Response.json({ success: true, report });
  } catch (error) {
    console.error('cleanupBadQualityGames error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});