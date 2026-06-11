import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Zap, Loader2, Settings, Activity, Wrench, Library } from 'lucide-react';
import LaunchSettingsModal from '@/components/admin/LaunchSettingsModal';
import LaunchManualControl from '@/components/admin/LaunchManualControl';
import BackgroundActivityPanel from '@/components/admin/BackgroundActivityPanel';
import ResumeGenerateButton from '@/components/admin/ResumeGenerateButton';
import ContentProgressBar from '@/components/admin/ContentProgressBar';
import LibraryGeneratorPanel from '@/components/admin/LibraryGeneratorPanel';

export default function LaunchControlPanel() {
  const [tab, setTab] = useState('monitor');
  const [bgEnabled, setBgEnabled] = useState(false);
  const [bgStoryEnabled, setBgStoryEnabled] = useState(false);
  const [bgToggling, setBgToggling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const loadBgStatus = async () => {
    try {
      const settings = await base44.entities.QCSetting.list();
      setBgEnabled(settings[0]?.backgroundLaunchEnabled === true);
      setBgStoryEnabled(settings[0]?.backgroundStoryEnabled === true);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { loadBgStatus(); }, []);

  const toggleBackground = async () => {
    setBgToggling(true);
    try {
      const settings = await base44.entities.QCSetting.list();
      const anyOn = bgEnabled || bgStoryEnabled;
      const next = !anyOn;
      const payload = { backgroundLaunchEnabled: next, backgroundStoryEnabled: next };
      if (settings.length > 0) {
        await base44.entities.QCSetting.update(settings[0].id, payload);
      } else {
        await base44.entities.QCSetting.create({ intervalMinutes: 10, ...payload });
      }
      setBgEnabled(next);
      setBgStoryEnabled(next);
    } finally {
      setBgToggling(false);
    }
  };

  const anyOn = bgEnabled || bgStoryEnabled;

  return (
    <div className="space-y-4">
      {/* Master Background Toggle — hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-5 ring-1 ${anyOn ? 'bg-emerald-500/15 ring-emerald-300/40' : 'pro-glass'}`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${anyOn ? 'bg-emerald-400' : 'bg-slate-900'}`}>
              <Zap className={`w-6 h-6 ${anyOn ? 'text-emerald-950' : 'text-white'}`} />
            </div>
            <div>
              <p className="text-slate-900 font-black text-base">Background Auto-Generate</p>
              <p className="text-slate-600 text-xs">
                {anyOn
                  ? '🟢 Server jalan: KSSR (5 min) + Story Opus 4.7 (10 min). Browser boleh tutup.'
                  : 'Server akan auto-generate content untuk launch tanpa kena buka browser.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ResumeGenerateButton />
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
              className="bg-white text-slate-800 hover:bg-slate-50 border-slate-300"
            >
              <Settings className="w-4 h-4 mr-1.5" /> Targets
            </Button>
            <Button
              onClick={toggleBackground}
              disabled={bgToggling}
              className={anyOn
                ? 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black'
                : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black'}
            >
              {bgToggling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              {anyOn ? 'ON 🟢' : 'Turn ON'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Progress ringkas keseluruhan content */}
      <ContentProgressBar />

      {/* Tabs — 3 sahaja, kemas */}
      <div className="pro-glass flex gap-2 p-1.5 rounded-2xl">
        {[
          { key: 'monitor', label: 'Monitor', icon: Activity },
          { key: 'manual', label: 'Manual', icon: Wrench },
          { key: 'library', label: 'Library', icon: Library },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-1.5 ${
              tab === key ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-white/70'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'monitor' && <BackgroundActivityPanel />}
      {tab === 'manual' && <LaunchManualControl />}
      {tab === 'library' && <LibraryGeneratorPanel />}

      {/* Settings modal */}
      <LaunchSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={() => { /* tab content auto-refreshes on next interval */ }}
      />
    </div>
  );
}