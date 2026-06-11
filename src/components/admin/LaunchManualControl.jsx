import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import ResumeGenerateButton from '@/components/admin/ResumeGenerateButton';

const SUBJECT_LABELS = {
  bahasa_melayu: 'BM', english: 'English', mathematics: 'Math', science: 'Sains', jawi: 'Jawi', pendidikan_islam: 'P. Islam',
  pendidikan_moral: 'P. Moral', sejarah: 'Sejarah', rbt: 'RBT', pjk: 'PJK', seni: 'Seni',
};

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah',
  darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6',
};

export default function LaunchManualControl() {
  const [section, setSection] = useState('curriculum');
  const [kssr, setKssr] = useState(null);
  const [story, setStory] = useState(null);
  const [mini, setMini] = useState(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30));

  const loadAll = async () => {
    setLoading(true);
    try {
      const [k, s, m] = await Promise.all([
        base44.functions.invoke('launchGetProgress', {}),
        base44.functions.invoke('launchGetStoryProgress', {}),
        base44.functions.invoke('launchGetMiniGamesProgress', {}),
      ]);
      setKssr(k.data);
      setStory(s.data);
      setMini(m.data);
    } catch (e) {
      addLog(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const runBucket = async (row) => {
    const key = `${row.ageGroup}-${row.darjah || 'pra'}-${row.category}`;
    setWorking(key);
    addLog(`🚀 ${LEVEL_LABELS[row.darjah || row.ageGroup]} · ${SUBJECT_LABELS[row.category]} — generating...`);
    try {
      const res = await base44.functions.invoke('launchGenerateBatch', {
        ageGroup: row.ageGroup, darjah: row.darjah, category: row.category,
        targetCount: 30, dryRun: false,
      });
      addLog(`✅ +${res.data?.generated || 0} games (${res.data?.failed || 0} failed)`);
      await loadAll();
    } catch (e) {
      addLog(`❌ ${e.message}`);
    } finally {
      setWorking(null);
    }
  };

  const purgeBucket = async (row) => {
    if (!confirm(`Padam SEMUA ${row.count} games untuk ${LEVEL_LABELS[row.darjah || row.ageGroup]} · ${SUBJECT_LABELS[row.category]}?`)) return;
    const key = `${row.ageGroup}-${row.darjah || 'pra'}-${row.category}-purge`;
    setWorking(key);
    try {
      await base44.functions.invoke('launchPurgeBucket', {
        ageGroup: row.ageGroup, darjah: row.darjah, category: row.category, dryRun: false,
      });
      addLog(`🗑️ Purged ${LEVEL_LABELS[row.darjah || row.ageGroup]} · ${SUBJECT_LABELS[row.category]}`);
      await loadAll();
    } catch (e) {
      addLog(`❌ Purge error: ${e.message}`);
    } finally {
      setWorking(null);
    }
  };

  const generateStory = async () => {
    if (!confirm('Generate 5 cerita Story Kid (Claude Opus 4.7)?')) return;
    setWorking('story');
    addLog(`📖 Generating Story Kid batch...`);
    try {
      const res = await base44.functions.invoke('launchGenerateStoryKid', { targetCount: story.target });
      addLog(`✅ +${res.data?.generated || 0} stories (still needed: ${res.data?.stillNeeded || 0})`);
      await loadAll();
    } catch (e) {
      addLog(`❌ ${e.message}`);
    } finally {
      setWorking(null);
    }
  };

  const deleteAllStory = async () => {
    if (!confirm('⚠️ Padam SEMUA Story Kid games?')) return;
    setWorking('delete-story');
    try {
      const res = await base44.functions.invoke('deleteStoryKidGames', {});
      addLog(`🗑️ Deleted ${res.data?.deleted || 0} story games`);
      await loadAll();
    } catch (e) {
      addLog(`❌ ${e.message}`);
    } finally {
      setWorking(null);
    }
  };

  const deleteAllMini = async () => {
    if (!confirm('⚠️ Padam SEMUA Mini games?')) return;
    setWorking('delete-mini');
    try {
      const res = await base44.functions.invoke('deleteMiniGames', {});
      addLog(`🗑️ Deleted ${res.data?.deleted || 0} mini games`);
      await loadAll();
    } catch (e) {
      addLog(`❌ ${e.message}`);
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Resume — trigger satu pusingan KSSR generate secara manual */}
      <div className="pro-glass rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs font-semibold text-slate-600">
          Sambung generate bucket KSSR yang belum siap (sekali jalan, tanpa hidupkan auto).
        </p>
        <ResumeGenerateButton />
      </div>

      {/* Section tabs */}
      <div className="pro-glass flex gap-1.5 p-1.5 rounded-xl">
        {[
          { key: 'curriculum', label: '📚 KSSR' },
          { key: 'story', label: '📖 Story Kid' },
          { key: 'mini', label: '🎮 Mini Games' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg font-black text-xs transition-all ${
              section === t.key ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button onClick={loadAll} disabled={loading} className="px-3 rounded-lg bg-white/70 hover:bg-white text-slate-700 ring-1 ring-slate-300">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KSSR Section */}
      {section === 'curriculum' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {!kssr ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" /></div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4">
                <p className="font-black text-base">📚 KSSR Curriculum</p>
                <p className="text-xs text-white/85">{kssr.totalExisting}/{kssr.totalTarget} games · {kssr.overallPercent}% · {kssr.completeBuckets}/{kssr.totalBuckets} buckets complete</p>
              </div>
              <div className="grid grid-cols-12 bg-gray-100 px-4 py-2 text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                <div className="col-span-3">Peringkat</div>
                <div className="col-span-2">Subjek</div>
                <div className="col-span-2 text-center">Games</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-3 text-right">Aksi</div>
              </div>
              <div className="max-h-[55vh] overflow-y-auto">
                {kssr.rows.map((row) => {
                  const key = `${row.ageGroup}-${row.darjah || 'pra'}-${row.category}`;
                  const isWorking = working === key;
                  const isPurging = working === `${key}-purge`;
                  return (
                    <div key={key} className={`grid grid-cols-12 px-4 py-2 text-sm border-b border-gray-50 items-center ${row.status === 'complete' ? 'bg-green-50' : 'bg-white'}`}>
                      <div className="col-span-3 font-semibold text-xs">{LEVEL_LABELS[row.darjah || row.ageGroup]}</div>
                      <div className="col-span-2 text-xs">{SUBJECT_LABELS[row.category]}</div>
                      <div className="col-span-2 text-center font-mono text-xs">
                        <span className={row.status === 'complete' ? 'text-green-600 font-bold' : 'text-gray-700'}>{row.count}/{row.target}</span>
                      </div>
                      <div className="col-span-2">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${row.status === 'complete' ? 'bg-green-500' : row.percent > 50 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${row.percent}%` }} />
                        </div>
                      </div>
                      <div className="col-span-3 flex justify-end gap-1">
                        {row.status === 'complete' ? (
                          <span className="flex items-center gap-1 text-green-600 text-[11px] font-bold"><CheckCircle2 className="w-3 h-3" /> Done</span>
                        ) : (
                          <Button size="sm" onClick={() => runBucket(row)} disabled={isWorking} className="h-6 text-[11px] px-2">
                            {isWorking ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Play className="w-3 h-3 mr-0.5" /> +{Math.min(5, row.needed)}</>}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => purgeBucket(row)} disabled={isPurging} className="h-6 px-1.5 border-red-200 text-red-600 hover:bg-red-50">
                          {isPurging ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Story Section */}
      {section === 'story' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-5 text-white">
          {!story ? (
            <div className="text-center py-6"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : (
            <>
              <p className="font-black text-base">📖 Story Kid (Claude Opus 4.7)</p>
              <p className="text-3xl font-black mt-2">{story.count} <span className="text-base text-white/70">/ {story.target}</span></p>
              <p className="text-xs text-white/85 mb-4">{story.percent}% · {story.needed} stories needed</p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={generateStory} disabled={working === 'story' || story.needed === 0} className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black">
                  {working === 'story' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Play className="w-4 h-4 mr-2" /> Generate +5</>}
                </Button>
                <Button onClick={deleteAllStory} disabled={working === 'delete-story'} variant="destructive" size="sm" className="ml-auto">
                  {working === 'delete-story' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete All
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Mini Games Section */}
      {section === 'mini' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {!mini ? (
            <div className="bg-white/10 rounded-2xl p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-white mx-auto" /></div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
                <p className="font-black text-base">🎮 Mini Games</p>
                <p className="text-3xl font-black mt-2">{mini.totalExisting} <span className="text-base text-white/70">/ {mini.totalTarget}</span></p>
                <p className="text-xs text-white/85">{mini.overallPercent}% · {mini.completeBuckets}/{mini.totalBuckets} kategori complete</p>
                <p className="text-[11px] text-white/75 mt-2">ℹ️ Hand-crafted blueprints dari kod (tiada AI generation)</p>
                <div className="mt-3">
                  <Button onClick={deleteAllMini} disabled={working === 'delete-mini'} variant="destructive" size="sm">
                    {working === 'delete-mini' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete All
                  </Button>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-100 px-4 py-2 text-[10px] font-bold text-gray-700 uppercase">
                  <div className="col-span-5">Kategori</div>
                  <div className="col-span-2 text-center">Games</div>
                  <div className="col-span-3 text-center">Progress</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>
                <div className="max-h-[40vh] overflow-y-auto">
                  {mini.rows.map((row) => (
                    <div key={row.category} className={`grid grid-cols-12 px-4 py-2 text-xs border-b border-gray-50 items-center ${row.status === 'complete' ? 'bg-green-50' : ''}`}>
                      <div className="col-span-5 font-semibold">{row.label}</div>
                      <div className="col-span-2 text-center font-mono">{row.count}/{row.target}</div>
                      <div className="col-span-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${row.status === 'complete' ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${row.percent}%` }} />
                        </div>
                      </div>
                      <div className="col-span-2 text-right text-[11px] font-bold">
                        {row.status === 'complete' ? <span className="text-green-600">✅</span> : <span className="text-amber-600">{row.needed} needed</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Activity log */}
      {log.length > 0 && (
        <div className="bg-slate-900/90 text-emerald-300 rounded-xl p-3 font-mono text-[11px] max-h-40 overflow-y-auto ring-1 ring-white/10">
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </div>
  );
}