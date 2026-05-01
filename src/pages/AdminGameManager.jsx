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
  const [activeTab, setActiveTab] = useState('games');
  const [selectedFile, setSelectedFile] = useState('');
  const [gameIndex, setGameIndex] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [expandTargetCount, setExpandTargetCount] = useState(20);
  const [activeCategory, setActiveCategory] = useState('core');
  
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

  // ============ CREATE GAME ============
  const [createForm, setCreateForm] = useState({
    title: '',
    type: 'letter_match',
    category: 'bahasa_melayu',
    difficulty: 'easy',
    tier: 'free',
    emoji: '🎮',
    totalQuestions: 8,
  });

  const handleCreateGame = async () => {
    if (!createForm.title) return alert('Title required');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminCreate', {
        fileName: selectedFile,
        gameData: createForm,
      });
      setHistory([...history, { type: 'create', gameTitle: createForm.title, emoji: createForm.emoji }]);
      setCreateForm({ title: '', type: 'letter_match', category: 'bahasa_melayu', difficulty: 'easy', tier: 'free', emoji: '🎮', totalQuestions: 8 });
      alert('✅ Game created (backend integration needed to persist)');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ DELETE GAME ============
  const [deleteIndices, setDeleteIndices] = useState('');
  const handleDeleteGames = async () => {
    if (!deleteIndices) return alert('Enter game indices');
    setLoading(true);
    try {
      const indices = deleteIndices.split(',').map(x => parseInt(x.trim())).filter(n => !isNaN(n));
      const res = await base44.functions.invoke('gameAdminDelete', {
        fileName: selectedFile,
        gameIndices: indices,
      });
      setHistory([...history, { type: 'delete', count: res.data.deletedGames.length }]);
      setDeleteIndices('');
      alert(`✅ Deleted ${res.data.deletedGames.length} game(s)`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ TOGGLE PUBLISH ============
  const handleTogglePublish = async () => {
    if (!selectedFile || gameIndex === '') return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminTogglePublish', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
      });
      alert(`✅ ${res.data.message}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ UPDATE METADATA ============
  const [metaUpdates, setMetaUpdates] = useState({});
  const handleUpdateMetadata = async () => {
    if (!selectedFile || gameIndex === '' || Object.keys(metaUpdates).length === 0) return alert('Select game and updates');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminUpdateMetadata', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        updates: metaUpdates,
      });
      setHistory([...history, { type: 'metadata', gameIndex, fields: Object.keys(metaUpdates).length }]);
      setMetaUpdates({});
      alert(`✅ Updated ${Object.keys(metaUpdates).length} field(s)`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ REORDER ============
  const [reorderFrom, setReorderFrom] = useState('');
  const [reorderTo, setReorderTo] = useState('');
  const handleReorder = async () => {
    if (reorderFrom === '' || reorderTo === '') return alert('Enter from and to indices');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminReorder', {
        fileName: selectedFile,
        fromIndex: parseInt(reorderFrom),
        toIndex: parseInt(reorderTo),
      });
      setHistory([...history, { type: 'reorder', title: res.data.moved.title, from: reorderFrom, to: reorderTo }]);
      setReorderFrom('');
      setReorderTo('');
      alert(`✅ ${res.data.message}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ VALIDATE ============
  const [validation, setValidation] = useState(null);
  const handleValidate = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminValidate', {
        fileName: selectedFile,
      });
      setValidation(res.data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ RESTORE BACKUP ============
  const [restoreFile, setRestoreFile] = useState(null);
  const handleRestoreBackup = async () => {
    if (!restoreFile || !selectedFile) return alert('Select backup file and target');
    setLoading(true);
    try {
      const text = await restoreFile.text();
      const backupData = JSON.parse(text);
      const res = await base44.functions.invoke('gameAdminRestoreBackup', {
        fileName: selectedFile,
        backupData,
      });
      setHistory([...history, { type: 'restore', count: res.data.gamesRestored }]);
      setRestoreFile(null);
      alert(`✅ ${res.data.message}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
        targetCount: parseInt(expandTargetCount),
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
        targetCount: parseInt(expandTargetCount),
        previewOnly: false
      });
      if (res.data.success) {
        setHistory([...history, { type: 'expand', ...res.data }]);
        setPreview(null);
        setSelectedFile('');
        setGameIndex('');
        setExpandTargetCount(20);
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto p-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 pt-4">
          <h1 className="text-4xl font-black text-white mb-2">⚙️ Admin Game Manager</h1>
          <p className="text-white/80">Urus semua game data - tambah, kurang, expand, delete</p>
        </motion.div>

        {/* Category Buttons */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: 'core', label: '⚡ Core', desc: 'CRUD operations' },
            { id: 'metadata', label: '✏️ Metadata', desc: 'Edit properties' },
            { id: 'advanced', label: '🚀 Advanced', desc: 'Expand, Clone, Batch' },
            { id: 'tools', label: '🛠️ Tools', desc: 'Validate, Backup, Export' },
          ].map(cat => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Tabs by Category */}
        <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-2">
          {activeCategory === 'core' && [
            { id: 'games', label: '📚 Games List' },
            { id: 'create', label: '➕ Create' },
            { id: 'delete', label: '🗑️ Delete' },
          ].map(tab => (
            <motion.button key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-2xl' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20'}`}>{tab.label}</motion.button>
          ))}
          {activeCategory === 'metadata' && [
            { id: 'metadata', label: '✏️ Edit Properties' },
            { id: 'publish', label: '📤 Publish/Draft' },
            { id: 'reorder', label: '↕️ Reorder' },
          ].map(tab => (
            <motion.button key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-2xl' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20'}`}>{tab.label}</motion.button>
          ))}
          {activeCategory === 'advanced' && [
            { id: 'expand', label: '📈 Expand Soalan' },
            { id: 'clone', label: '📋 Clone' },
            { id: 'batch', label: '⚡ Batch Edit' },
            { id: 'search', label: '🔍 Search' },
            { id: 'analytics', label: '📊 Analytics' },
          ].map(tab => (
            <motion.button key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-2xl' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20'}`}>{tab.label}</motion.button>
          ))}
          {activeCategory === 'tools' && [
            { id: 'validate', label: '✓ Validate' },
            { id: 'backup', label: '💾 Backup' },
            { id: 'restore', label: '⬆️ Restore' },
            { id: 'export', label: '⬇️ Export' },
            { id: 'preview', label: '👁️ Preview' },
          ].map(tab => (
            <motion.button key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-2xl' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20'}`}>{tab.label}</motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="rounded-3xl p-6 mb-6 backdrop-blur-xl"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
        >
          {/* GAMES LIST */}
          {activeTab === 'games' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white mb-6">📚 All Games</h2>
              <GamesListView />
            </div>
          )}

          {/* CREATE GAME */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white mb-6">➕ Create New Game</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input type="text" value={createForm.title} onChange={(e) => setCreateForm({...createForm, title: e.target.value})} placeholder="Game title..." className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                  <select value={createForm.type} onChange={(e) => setCreateForm({...createForm, type: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium">
                    <option value="letter_match">Letter Match</option>
                    <option value="number_match">Number Match</option>
                    <option value="picture_quiz">Picture Quiz</option>
                    <option value="multiple_choice">Multiple Choice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Emoji</label>
                  <input type="text" value={createForm.emoji} onChange={(e) => setCreateForm({...createForm, emoji: e.target.value})} placeholder="🎮" className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none" maxLength="2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select value={createForm.category} onChange={(e) => setCreateForm({...createForm, category: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium">
                    <option value="bahasa_melayu">Bahasa Melayu</option>
                    <option value="english">English</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                  <select value={createForm.difficulty} onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tier</label>
                  <select value={createForm.tier} onChange={(e) => setCreateForm({...createForm, tier: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium">
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Questions</label>
                  <input type="number" min="1" max="50" value={createForm.totalQuestions} onChange={(e) => setCreateForm({...createForm, totalQuestions: parseInt(e.target.value)})} className="w-full p-3 border-2 border-gray-300 rounded-xl" />
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleCreateGame} disabled={loading || !createForm.title} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {loading ? 'Creating...' : 'Create Game'}
              </motion.button>
            </div>
          )}

          {/* DELETE GAME */}
          {activeTab === 'delete' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white mb-6">🗑️ Delete Games</h2>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">File</label>
                <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} className="w-full p-3 border-2 border-white/30 rounded-xl font-medium bg-white/20 text-white placeholder-white/50 backdrop-blur-md focus:border-white/50 focus:outline-none">
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Game Indices (comma-separated)</label>
                <input type="text" value={deleteIndices} onChange={(e) => setDeleteIndices(e.target.value)} placeholder="e.g. 0,2,5" className="w-full p-3 border-2 border-white/30 rounded-xl bg-white/20 text-white placeholder-white/50 backdrop-blur-md focus:border-white/50 focus:outline-none" />
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 text-sm">
                <p className="font-bold text-red-900">⚠️ Warning: This action cannot be undone!</p>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleDeleteGames} disabled={loading || !deleteIndices} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                {loading ? 'Deleting...' : 'Delete Games'}
              </motion.button>
            </div>
          )}

          {/* METADATA EDITOR */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">✏️ Edit Game Properties</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                  <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium">
                    {GAME_FILES.map(file => (
                      <option key={file} value={file}>{file}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Game Index</label>
                  <input type="number" min="0" value={gameIndex} onChange={(e) => { setGameIndex(e.target.value); setMetaUpdates({}); }} className="w-full p-3 border-2 border-gray-300 rounded-xl" />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-bold text-gray-800">Update Fields (leave empty to keep)</p>
                <input type="text" placeholder="New title" onChange={(e) => e.target.value ? setMetaUpdates({...metaUpdates, title: e.target.value}) : setMetaUpdates({...metaUpdates, title: undefined})} className="w-full p-2.5 border border-blue-300 rounded-lg text-sm" />
                <input type="text" placeholder="New emoji" maxLength="2" onChange={(e) => e.target.value ? setMetaUpdates({...metaUpdates, emoji: e.target.value}) : setMetaUpdates({...metaUpdates, emoji: undefined})} className="w-full p-2.5 border border-blue-300 rounded-lg text-sm" />
                <select onChange={(e) => e.target.value ? setMetaUpdates({...metaUpdates, difficulty: e.target.value}) : setMetaUpdates({...metaUpdates, difficulty: undefined})} className="w-full p-2.5 border border-blue-300 rounded-lg text-sm font-medium">
                  <option value="">-- Difficulty --</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleUpdateMetadata} disabled={loading || gameIndex === '' || Object.keys(metaUpdates).length === 0} className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'Updating...' : 'Save Changes'}
              </motion.button>
            </div>
          )}

          {/* PUBLISH/DRAFT */}
          {activeTab === 'publish' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📤 Publish/Draft Management</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                  <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium">
                    {GAME_FILES.map(file => (
                      <option key={file} value={file}>{file}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Game Index</label>
                  <input type="number" min="0" value={gameIndex} onChange={(e) => setGameIndex(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl" />
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleTogglePublish} disabled={loading || gameIndex === ''} className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '📤'}
                {loading ? 'Toggling...' : 'Toggle Publish Status'}
              </motion.button>
            </div>
          )}

          {/* REORDER */}
          {activeTab === 'reorder' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">↕️ Reorder Games</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium">
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">From Index</label>
                  <input type="number" min="0" value={reorderFrom} onChange={(e) => setReorderFrom(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">To Index</label>
                  <input type="number" min="0" value={reorderTo} onChange={(e) => setReorderTo(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl" />
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleReorder} disabled={loading || reorderFrom === '' || reorderTo === ''} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '↕️'}
                {loading ? 'Moving...' : 'Move Game'}
              </motion.button>
            </div>
          )}

          {/* VALIDATE */}
          {activeTab === 'validate' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">✓ Validate Games</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                <select value={selectedFile} onChange={(e) => { setSelectedFile(e.target.value); setValidation(null); }} className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium">
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleValidate} disabled={loading || !selectedFile} className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '✓'}
                {loading ? 'Validating...' : 'Start Validation'}
              </motion.button>

              {validation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg p-4 space-y-3 ${validation.isValid ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                  <p className="font-black text-lg">{validation.message}</p>
                  <p className="text-sm font-bold">{validation.totalGames} games • {validation.issues.length} issue(s) • {validation.warnings.length} warning(s)</p>
                  {validation.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-red-700">Issues:</p>
                      {validation.issues.map((issue, i) => (
                        <p key={i} className="text-xs text-red-600 ml-2">• {issue}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* RESTORE BACKUP */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">⬆️ Restore Backup</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target File</label>
                <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium">
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Backup File</label>
                <input type="file" accept=".json" onChange={(e) => setRestoreFile(e.target.files?.[0] || null)} className="w-full p-3 border-2 border-gray-300 rounded-xl" />
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 text-sm">
                <p className="font-bold text-yellow-900">⚠️ This will replace all games in the selected file!</p>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleRestoreBackup} disabled={loading || !restoreFile || !selectedFile} className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
                {loading ? 'Restoring...' : 'Restore Backup'}
              </motion.button>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Game Index <span className="text-xs text-gray-500">(Nombor urutan game)</span></label>
                <input
                  type="number"
                  min="0"
                  value={gameIndex}
                  onChange={(e) => {
                    setGameIndex(e.target.value);
                    setPreview(null);
                  }}
                  placeholder="e.g. 0 = game pertama, 1 = game kedua..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                />
                <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded-lg">💡 Tip: Pergi tab <strong>📚 Games List</strong> dulu untuk cari "Index:" game yang nak expand</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Soalan Count</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="8"
                    max="100"
                    value={expandTargetCount}
                    onChange={(e) => setExpandTargetCount(e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                  />
                  <span className="text-gray-700 text-sm font-bold min-w-fit">soalan</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Boleh set dari 8 hingga 100</p>
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
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="rounded-3xl p-6 backdrop-blur-xl"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
          >
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Activity History ({history.length})
            </h3>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl backdrop-blur-md" style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)' }}>
                  <div>
                    <p className="font-bold text-white">{item.gameTitle}</p>
                    <p className="text-xs text-white/60">{item.type.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-300">+{item.newQuestionsAdded || 0}</p>
                    <p className="text-xs text-white/60">Total: {item.totalQuestions}</p>
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