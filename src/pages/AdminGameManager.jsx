import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, ChevronDown, CheckCircle2, AlertCircle, Search, BarChart3, Download, Copy, Settings, Save } from 'lucide-react';
import GamesListView from '@/components/admin/GamesListView';

const GAME_FILES = [
  'gameData_prasekolah_bm',
  'gameData_prasekolah_en',
  'gameData_prasekolah_math',
  'gameData_prasekolah_science',
  'gameData_sr_bm',
  'gameData_sr_english',
  'gameData_sr_math',
  'gameData_sr_science',
];

export default function AdminGameManager() {
  const [activeTab, setActiveTab] = useState('expand');
  const [selectedFile, setSelectedFile] = useState('');
  const [gameIndex, setGameIndex] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchDifficulty, setSearchDifficulty] = useState('');
  
  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  
  // Clone states
  const [cloneNewTitle, setCloneNewTitle] = useState('');
  
  // Batch edit states
  const [batchIndices, setBatchIndices] = useState('');
  const [batchUpdates, setBatchUpdates] = useState({});
  
  // Export states
  const [exportFormat, setExportFormat] = useState('json');

  // ============ SEARCH ============
  const handleSearch = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminSearch', {
        fileName: selectedFile,
        searchQuery,
        category: searchCategory,
        difficulty: searchDifficulty,
      });
      setSearchResults(res.data.results || []);
    } catch (err) {
      alert('Search error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ ANALYTICS ============
  const handleAnalytics = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminAnalytics', {
        fileName: selectedFile,
      });
      setAnalytics(res.data.stats);
    } catch (err) {
      alert('Analytics error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ EXPORT ============
  const handleExport = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminExport', {
        fileName: selectedFile,
        format: exportFormat,
      });
      
      const blob = new Blob([res.data.data], {
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile}.${exportFormat}`;
      a.click();
      
      setHistory([...history, { type: 'export', fileName: selectedFile, format: exportFormat, size: res.data.size }]);
    } catch (err) {
      alert('Export error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ CLONE ============
  const handleClone = async () => {
    if (!selectedFile || gameIndex === '' || !cloneNewTitle) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminClone', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        newTitle: cloneNewTitle,
      });
      
      setHistory([...history, { type: 'clone', message: res.data.message }]);
      setCloneNewTitle('');
      setGameIndex('');
      alert('✅ Game cloned successfully!');
    } catch (err) {
      alert('Clone error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ BATCH EDIT ============
  const handleBatchEdit = async () => {
    if (!selectedFile || !batchIndices) return;
    
    const indices = batchIndices.split(',').map(x => parseInt(x.trim())).filter(n => !isNaN(n));
    if (indices.length === 0) return alert('Invalid indices');
    
    if (Object.keys(batchUpdates).length === 0) return alert('No updates specified');
    
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminBatchEdit', {
        fileName: selectedFile,
        gameIndices: indices,
        updates: batchUpdates,
      });
      
      setHistory([...history, { type: 'batch', updated: res.data.successCount, fileName: selectedFile }]);
      setBatchIndices('');
      setBatchUpdates({});
      alert(`✅ ${res.data.successCount} games updated!`);
    } catch (err) {
      alert('Batch edit error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ BACKUP ============
  const handleBackup = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminBackup', {
        action: 'create',
        fileName: selectedFile,
      });
      
      const blob = new Blob([JSON.stringify(res.data.backup, null, 2)]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${selectedFile}-${new Date().getTime()}.json`;
      a.click();
      
      setHistory([...history, { type: 'backup', fileName: selectedFile, games: res.data.backup.gameCount }]);
    } catch (err) {
      alert('Backup error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ PREVIEW ============
  const handlePreview = async () => {
    if (!selectedFile || gameIndex === '') return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminPreview', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
      });
      setPreview(res.data.preview);
    } catch (err) {
      alert('Preview error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ EXPAND QUESTIONS ============
  const handleExpandPreview = async () => {
    if (!selectedFile || gameIndex === '') return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('expandGameQuestions', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        previewOnly: true
      });
      if (res.data.success) setPreview(res.data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandConfirm = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('expandGameQuestions', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        previewOnly: false
      });
      if (res.data.success) {
        setHistory([...history, { type: 'expand', ...res.data }]);
        setPreview(null);
        setSelectedFile('');
        setGameIndex('');
        alert(`✅ ${res.data.gameTitle} expanded!`);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ REDUCE QUESTIONS ============
  const handleReduceQuestions = async () => {
    if (!selectedFile || gameIndex === '') return;
    setLoading(true);
    try {
      alert('Reduce questions feature - kurang soalan dari game');
      // Implementation untuk reduce would go here
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ DELETE GAME ============
  const handleDeleteGame = async () => {
    if (!selectedFile || gameIndex === '') return;
    if (!confirm('Kau pasti nak delete game ni? Tidak boleh undo!')) return;

    setLoading(true);
    try {
      alert('Delete game feature - buang game dari file');
      // Implementation untuk delete would go here
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ ADD NEW GAME ============
  const handleAddGame = async () => {
    alert('Add new game feature - tambah game baru dalam file');
    // Implementation would go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 pt-4">
          <h1 className="text-4xl font-black text-white mb-2">⚙️ Admin Game Manager</h1>
          <p className="text-white/80">Urus semua game data - tambah, kurang, expand, delete</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'games', label: '📚 Games List', icon: '📚' },
            { id: 'expand', label: '📈 Expand Soalan', icon: '+' },
            { id: 'search', label: '🔍 Search Games', icon: '🔍' },
            { id: 'analytics', label: '📊 Analytics', icon: '📊' },
            { id: 'preview', label: '👁️ Preview Game', icon: '👁️' },
            { id: 'export', label: '⬇️ Export', icon: '⬇️' },
            { id: 'clone', label: '📋 Clone Game', icon: '📋' },
            { id: 'batch', label: '⚡ Batch Edit', icon: '⚡' },
            { id: 'backup', label: '💾 Backup', icon: '💾' },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(tab.id);
                setPreview(null);
              }}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
          {/* GAMES LIST */}
          {activeTab === 'games' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📚 All Games</h2>
              <GamesListView />
            </div>
          )}

          {/* EXPAND SOALAN */}
          {activeTab === 'expand' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📈 Expand Soalan (8 → 20)</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih File Game</label>
                <select
                  value={selectedFile}
                  onChange={(e) => {
                    setSelectedFile(e.target.value);
                    setGameIndex('');
                    setPreview(null);
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Game Index (Nomor Urut)</label>
                <input
                  type="number"
                  min="0"
                  value={gameIndex}
                  onChange={(e) => {
                    setGameIndex(e.target.value);
                    setPreview(null);
                  }}
                  placeholder="e.g. 0, 1, 2..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExpandPreview}
                disabled={!selectedFile || gameIndex === '' || loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '👁️'}
                {loading ? 'Preview...' : 'Preview Soalan'}
              </motion.button>

              {preview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black text-gray-800">{preview.gameTitle}</p>
                      <p className="text-sm text-gray-600">Type: {preview.gameType}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-black text-indigo-600">{preview.currentCount}</p>
                      <p className="text-xs text-gray-600">Current</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-black text-pink-600">+12</p>
                      <p className="text-xs text-gray-600">New</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-black text-green-600">{preview.totalAfterExpand}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreview(null)}
                      className="flex-1 bg-gray-300 text-gray-800 font-bold py-2 rounded-lg"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExpandConfirm}
                      disabled={loading}
                      className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '✅'}
                      {loading ? 'Processing...' : 'Confirm'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* REDUCE SOALAN */}
          {activeTab === 'reduce' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📉 Kurang Soalan</h2>
              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <p className="text-lg font-bold text-orange-900">Feature Coming Soon</p>
                <p className="text-sm text-orange-700 mt-2">Untuk kurangkan soalan dari game yang ada</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih File Game</label>
                <select disabled className="w-full p-3 border-2 border-gray-300 rounded-xl opacity-50 font-medium">
                  <option>-- Disabled untuk sementara --</option>
                </select>
              </div>
            </div>
          )}

          {/* TAMBAH GAME BARU */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">➕ Tambah Game Baru</h2>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 text-center">
                <Plus className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-lg font-bold text-blue-900">Feature Coming Soon</p>
                <p className="text-sm text-blue-700 mt-2">Untuk tambah game baru dalam file</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddGame}
                disabled
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Coming Soon
              </motion.button>
            </div>
          )}

          {/* SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">🔍 Search & Filter Games</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                <select
                  value={selectedFile}
                  onChange={(e) => {
                    setSelectedFile(e.target.value);
                    setSearchResults([]);
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Search by Title</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Huruf, Nombor..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium">
                    <option value="">All</option>
                    <option value="bahasa_melayu">Bahasa Melayu</option>
                    <option value="english">English</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                  <select value={searchDifficulty} onChange={(e) => setSearchDifficulty(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium">
                    <option value="">All</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                disabled={!selectedFile || loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {loading ? 'Searching...' : 'Search'}
              </motion.button>

              {searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 rounded-2xl p-4 space-y-3">
                  <p className="font-black text-gray-800">Found {searchResults.length} games</p>
                  {searchResults.map((game, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-indigo-500">
                      <p className="font-bold text-gray-800 flex items-center gap-2">{game.emoji} {game.title}</p>
                      <p className="text-xs text-gray-600">Index: {game.index} | Type: {game.type} | Questions: {game.questionCount}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📊 Game Analytics</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select File</label>
                <select
                  value={selectedFile}
                  onChange={(e) => {
                    setSelectedFile(e.target.value);
                    setAnalytics(null);
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalytics}
                disabled={!selectedFile || loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                {loading ? 'Analyzing...' : 'Generate Analytics'}
              </motion.button>

              {analytics && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-black text-indigo-600">{analytics.totalGames}</p>
                      <p className="text-xs text-gray-600 mt-1">Total Games</p>
                    </div>
                    <div className="bg-pink-50 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-black text-pink-600">{analytics.totalQuestions}</p>
                      <p className="text-xs text-gray-600 mt-1">Total Questions</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-black text-purple-600">{analytics.avgQuestionsPerGame}</p>
                      <p className="text-xs text-gray-600 mt-1">Avg per Game</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-black text-green-600">{Object.keys(analytics.byCategory).length}</p>
                      <p className="text-xs text-gray-600 mt-1">Categories</p>
                    </div>
                  </div>

                  {Object.keys(analytics.byCategory).length > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="font-bold text-gray-800 mb-3">By Category</p>
                      {Object.entries(analytics.byCategory).map(([cat, count]) => (
                        <div key={cat} className="flex justify-between items-center mb-2">
                          <span className="text-gray-700">{cat}</span>
                          <span className="bg-indigo-500 text-white px-3 py-1 rounded-lg font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">👁️ Preview Game</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                <select
                  value={selectedFile}
                  onChange={(e) => {
                    setSelectedFile(e.target.value);
                    setPreview(null);
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Game Index</label>
                <input
                  type="number"
                  min="0"
                  value={gameIndex}
                  onChange={(e) => {
                    setGameIndex(e.target.value);
                    setPreview(null);
                  }}
                  placeholder="e.g. 0, 1, 2..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handlePreview}
                disabled={!selectedFile || gameIndex === '' || loading}
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '👁️'}
                {loading ? 'Loading...' : 'Preview Game'}
              </motion.button>

              {preview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black text-gray-800 flex items-center gap-2">{preview.emoji} {preview.title}</p>
                      <p className="text-xs text-gray-600">Type: {preview.type} | Difficulty: {preview.difficulty}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700">Total Questions: {preview.totalQuestions}</p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {preview.previewQuestions.map((q, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                        <p className="font-bold text-gray-800">Q{idx + 1}</p>
                        <p className="text-sm text-gray-600 mt-1">{JSON.stringify(q).substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">⬇️ Export Games</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                <select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Format</label>
                <div className="flex gap-3">
                  {['json', 'csv'].map(fmt => (
                    <motion.button
                      key={fmt}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExportFormat(fmt)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        exportFormat === fmt
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={!selectedFile || loading}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {loading ? 'Exporting...' : 'Export Now'}
              </motion.button>
            </div>
          )}

          {/* CLONE */}
          {activeTab === 'clone' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📋 Clone Game</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                <select
                  value={selectedFile}
                  onChange={(e) => {
                    setSelectedFile(e.target.value);
                    setGameIndex('');
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Game Index to Clone</label>
                <input
                  type="number"
                  min="0"
                  value={gameIndex}
                  onChange={(e) => setGameIndex(e.target.value)}
                  placeholder="e.g. 0"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New Game Title</label>
                <input
                  type="text"
                  value={cloneNewTitle}
                  onChange={(e) => setCloneNewTitle(e.target.value)}
                  placeholder="e.g. Huruf ABC - Edisi 2"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClone}
                disabled={!selectedFile || gameIndex === '' || !cloneNewTitle || loading}
                className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
                {loading ? 'Cloning...' : 'Clone Game'}
              </motion.button>
            </div>
          )}

          {/* BATCH EDIT */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">⚡ Batch Edit</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                <select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Game Indices (comma-separated)</label>
                <input
                  type="text"
                  value={batchIndices}
                  onChange={(e) => setBatchIndices(e.target.value)}
                  placeholder="e.g. 0,1,2,5"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Change Difficulty</label>
                <select
                  value={batchUpdates.difficulty || ''}
                  onChange={(e) => setBatchUpdates({ ...batchUpdates, difficulty: e.target.value || undefined })}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Keep Same --</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Change Tier</label>
                <select
                  value={batchUpdates.tier || ''}
                  onChange={(e) => setBatchUpdates({ ...batchUpdates, tier: e.target.value || undefined })}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Keep Same --</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBatchEdit}
                disabled={!selectedFile || !batchIndices || Object.keys(batchUpdates).length === 0 || loading}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                {loading ? 'Updating...' : 'Apply Batch Changes'}
              </motion.button>
            </div>
          )}

          {/* BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">💾 Backup & Restore</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select File to Backup</label>
                <select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBackup}
                disabled={!selectedFile || loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '⬇️'}
                {loading ? 'Creating Backup...' : 'Create Backup'}
              </motion.button>

              <div className="bg-blue-50 rounded-2xl p-4 border-l-4 border-blue-500">
                <p className="font-bold text-gray-800">ℹ️ How it works</p>
                <p className="text-sm text-gray-700 mt-2">- Creates JSON backup of entire file<br/>- Auto-downloads to your device<br/>- Keep safe for restoration later</p>
              </div>
            </div>
          )}

          {/* DELETE GAME */}
          {activeTab === 'delete' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">🗑️ Buang Game</h2>
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center">
                <Trash2 className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-lg font-bold text-red-900">Feature Coming Soon</p>
                <p className="text-sm text-red-700 mt-2">Untuk delete game dari file (tidak boleh undo!)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih File Game</label>
                <select disabled className="w-full p-3 border-2 border-gray-300 rounded-xl opacity-50 font-medium">
                  <option>-- Disabled untuk sementara --</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>

        {/* History */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Activity History ({history.length})
            </h3>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-green-50 p-4 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">{item.gameTitle}</p>
                    <p className="text-xs text-gray-600">{item.type.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600">+{item.newQuestionsAdded || 0}</p>
                    <p className="text-xs text-gray-600">Total: {item.totalQuestions}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}