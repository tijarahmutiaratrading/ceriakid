import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Zap, RefreshCw, Loader2, CheckCircle2, Clock, BookOpen, GraduationCap, Gamepad2 } from 'lucide-react';

export default function BackgroundProgressPanel() {
  const [loading, setLoading] = useState(true);
  const [kssrEnabled, setKssrEnabled] = useState(false);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const [kssrProgress, setKssrProgress] = useState(null);
  const [storyProgress, setStoryProgress] = useState(null);
  const [miniProgress, setMiniProgress] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [settingsRes, kssrRes, storyRes, miniRes] = await Promise.all([
        base44.entities.QCSetting.list(),
        base44.functions.invoke('launchGetProgress', {}),
        base44.functions.invoke('launchGetStoryProgress', {}),
        base44.functions.invoke('launchGetMiniGamesProgress', {}),
      ]);
      const s = settingsRes[0] || {};
      setKssrEnabled(s.backgroundLaunchEnabled === true);
      setStoryEnabled(s.backgroundStoryEnabled === true);
      setKssrProgress(kssrRes.data);
      setStoryProgress(storyRes.data);
      setMiniProgress(miniRes.data);
      setLastCheck(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // Auto-refresh every 2 minutes (gentle) to avoid rate limits.
    // Background automations already run on server independently.
    const interval = setInterval(() => {
      if (kssrEnabled || storyEnabled) loadAll();
    }, 120000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kssrEnabled, storyEnabled]);

  const anyEnabled = kssrEnabled || storyEnabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 md:p-7 rounded-[2rem] shadow-2xl shadow-black/20"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.22)',
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${anyEnabled ? 'bg-green-400/30' : 'bg-white/10'}`}>
            <Zap className={`w-5 h-5 ${anyEnabled ? 'text-green-300' : 'text-white/60'}`} />
          </div>
          <div>
            <h2 className="font-black text-white text-lg">🤖 Background Auto-Generate</h2>
            <p className="text-white/55 text-xs">
              {lastCheck ? `Last check: ${lastCheck.toLocaleTimeString()}` : 'Loading...'}
              {anyEnabled && <span className="ml-2 text-green-300">• Auto-refresh 2 min</span>}
            </p>
          </div>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-white/70 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !kssrProgress ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {/* KSSR Card */}
          <div className={`rounded-2xl p-4 border-2 ${kssrEnabled ? 'bg-green-500/10 border-green-300/40' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-black text-sm">KSSR Curriculum</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${kssrEnabled ? 'bg-green-400 text-green-900' : 'bg-white/10 text-white/60'}`}>
                {kssrEnabled ? 'ON 🟢' : 'OFF'}
              </span>
            </div>

            {kssrProgress && (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-black text-white">{kssrProgress.overallPercent}%</span>
                  <span className="text-xs text-white/60">{kssrProgress.totalExisting}/{kssrProgress.totalTarget}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all"
                    style={{ width: `${kssrProgress.overallPercent}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Buckets</p>
                    <p className="text-sm font-black text-white">{kssrProgress.completeBuckets}/{kssrProgress.totalBuckets}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Needed</p>
                    <p className="text-sm font-black text-yellow-300">{kssrProgress.totalNeeded}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Interval</p>
                    <p className="text-sm font-black text-blue-300">5 min</p>
                  </div>
                </div>
                {kssrEnabled && kssrProgress.totalNeeded > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-300">
                    <Clock className="w-3 h-3 animate-pulse" /> Server generating ~5 games per run
                  </div>
                )}
                {kssrProgress.totalNeeded === 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-300">
                    <CheckCircle2 className="w-3 h-3" /> COMPLETE — auto-disabled
                  </div>
                )}
              </>
            )}
          </div>

          {/* Story Card */}
          <div className={`rounded-2xl p-4 border-2 ${storyEnabled ? 'bg-green-500/10 border-green-300/40' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-pink-300" />
                <span className="text-white font-black text-sm">Story Kid (Opus 4.7)</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${storyEnabled ? 'bg-green-400 text-green-900' : 'bg-white/10 text-white/60'}`}>
                {storyEnabled ? 'ON 🟢' : 'OFF'}
              </span>
            </div>

            {storyProgress && (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-black text-white">{storyProgress.percent}%</span>
                  <span className="text-xs text-white/60">{storyProgress.count}/{storyProgress.target}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all"
                    style={{ width: `${storyProgress.percent}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Stories</p>
                    <p className="text-sm font-black text-white">{storyProgress.count}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Needed</p>
                    <p className="text-sm font-black text-pink-300">{storyProgress.needed}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Interval</p>
                    <p className="text-sm font-black text-blue-300">10 min</p>
                  </div>
                </div>
                {storyEnabled && storyProgress.needed > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-300">
                    <Clock className="w-3 h-3 animate-pulse" /> Generating with Claude Opus 4.7
                  </div>
                )}
                {storyProgress.needed === 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-300">
                    <CheckCircle2 className="w-3 h-3" /> COMPLETE — auto-disabled
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mini Games Card (static blueprints — info only) */}
          <div className="rounded-2xl p-4 border-2 bg-amber-500/10 border-amber-300/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-amber-300" />
                <span className="text-white font-black text-sm">Mini Games</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-200">
                STATIC
              </span>
            </div>

            {miniProgress && (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-black text-white">{miniProgress.overallPercent}%</span>
                  <span className="text-xs text-white/60">{miniProgress.totalExisting}/{miniProgress.totalTarget}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                    style={{ width: `${miniProgress.overallPercent}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Categories</p>
                    <p className="text-sm font-black text-white">{miniProgress.completeBuckets}/{miniProgress.totalBuckets}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Needed</p>
                    <p className="text-sm font-black text-amber-300">{miniProgress.totalNeeded}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/50 font-bold">Source</p>
                    <p className="text-sm font-black text-blue-300">Code</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-200">
                  <CheckCircle2 className="w-3 h-3" /> Hand-crafted blueprints (no AI generation)
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!anyEnabled && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 text-center">
          💡 Tekan butang <span className="font-bold text-yellow-300">Turn ON Background</span> di atas untuk start auto-generation di server.
        </div>
      )}
    </motion.div>
  );
}