import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function LaunchSettingsModal({ isOpen, onClose, onSave }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) loadSettings();
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.QCSetting.list();
      if (data.length > 0) {
        setSettings({
          subjectCap: data[0].subjectCap || 30,
          miniGameCap: data[0].miniGameCap || 30,
          storyKidCap: data[0].storyKidCap || 30,
          id: data[0].id,
        });
      } else {
        setSettings({
          subjectCap: 30,
          miniGameCap: 30,
          storyKidCap: 30,
          id: null,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      if (settings.id) {
        await base44.entities.QCSetting.update(settings.id, {
          subjectCap: parseInt(settings.subjectCap) || 30,
          miniGameCap: parseInt(settings.miniGameCap) || 30,
          storyKidCap: parseInt(settings.storyKidCap) || 30,
        });
      } else {
        await base44.entities.QCSetting.create({
          intervalMinutes: 10,
          subjectCap: parseInt(settings.subjectCap) || 30,
          miniGameCap: parseInt(settings.miniGameCap) || 30,
          storyKidCap: parseInt(settings.storyKidCap) || 30,
        });
      }
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900">⚙️ Target Settings</h2>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-game-purple" />
                </div>
              ) : settings ? (
                <div className="space-y-5">
                  {/* Subject Games Cap */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📚 KSSR Subject Games Target
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Games per subject bucket (e.g., Prasekolah + BM)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.subjectCap}
                        onChange={(e) =>
                          setSettings({ ...settings, subjectCap: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-bold text-lg"
                      />
                      <span className="text-gray-600 font-semibold">games</span>
                    </div>
                  </div>

                  {/* Mini Games Cap */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🎮 Mini Games Target
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Games per mini game category (memory, logic, etc.)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.miniGameCap}
                        onChange={(e) =>
                          setSettings({ ...settings, miniGameCap: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-bold text-lg"
                      />
                      <span className="text-gray-600 font-semibold">games</span>
                    </div>
                  </div>

                  {/* Story Kid Cap */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📖 Story Kid Target
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Total Story Kid games</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.storyKidCap}
                        onChange={(e) =>
                          setSettings({ ...settings, storyKidCap: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-bold text-lg"
                      />
                      <span className="text-gray-600 font-semibold">games</span>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                    <p className="font-semibold mb-1">💡 Bagaimana ini berfungsi:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Target digunakan untuk detect sejauh mana completion</li>
                      <li>System akan show "X needed" untuk capai target</li>
                      <li>Progress % berdasarkan target yang ditetapkan</li>
                    </ul>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-game-purple hover:bg-game-purple/90 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Targets
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}