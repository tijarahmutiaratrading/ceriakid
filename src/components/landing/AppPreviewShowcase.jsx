import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'game', label: '🎮 Cuba Main', emoji: '🎮' },
  { id: 'subjects', label: '📚 Subjek & Mini', emoji: '📚' },
  { id: 'story', label: '📖 Story Kid', emoji: '📖' },
  { id: 'parent', label: '📊 Dashboard Ibu Bapa', emoji: '📊' },
  { id: 'progress', label: '🏆 Prestasi Anak', emoji: '🏆' },
];

// Mini interactive game
function GameSample() {
  const questions = [
    { q: 'Apakah huruf awal bagi perkataan "BUKU"?', options: ['A', 'B', 'C', 'D'], answer: 1, subject: 'Bahasa Melayu' },
    { q: '5 + 7 = ?', options: ['10', '11', '12', '13'], answer: 2, subject: 'Matematik' },
    { q: 'Which animal lives in the sea?', options: ['Cat', 'Dog', 'Fish', 'Bird'], answer: 2, subject: 'English' },
    { q: 'Haiwan manakah yang makan daun?', options: ['Harimau', 'Arnab', 'Buaya', 'Singa'], answer: 1, subject: 'Sains' },
  ];
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[qIdx];

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx + 1 < questions.length) {
        setQIdx(idx => idx + 1);
        setSelected(null);
      } else {
        setDone(true);
      }
    }, 900);
  };

  const reset = () => { setQIdx(0); setSelected(null); setScore(0); setDone(false); };

  if (done) return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <div className="text-6xl">{'🏆'}</div>
      <h3 className="font-black text-2xl text-slate-900">Tahniah! 🎉</h3>
      <p className="text-lg font-bold text-slate-700">Markah: <span className="text-orange-500">{score}/{questions.length}</span></p>
      <div className="flex gap-1">{[...Array(questions.length)].map((_, i) => <span key={i} className={`text-2xl ${i < score ? '⭐' : '☆'}`}>{i < score ? '⭐' : '☆'}</span>)}</div>
      <button onClick={reset} className="mt-2 px-6 py-3 rounded-full bg-orange-500 text-white font-black text-sm shadow-lg">Cuba Lagi!</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{q.subject}</span>
        <span className="text-xs font-bold text-slate-500">Soalan {qIdx + 1} / {questions.length}</span>
        <span className="text-xs font-black text-orange-500">⭐ {score} mata</span>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${((qIdx) / questions.length) * 100}%` }} />
      </div>
      {/* Question */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 mb-4 border border-purple-100 text-center">
        <p className="font-black text-slate-900 text-lg leading-snug">{q.q}</p>
      </div>
      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          let style = 'bg-white border-2 border-gray-200 text-slate-800 hover:border-orange-400 hover:bg-orange-50';
          if (selected !== null) {
            if (i === q.answer) style = 'bg-green-100 border-2 border-green-500 text-green-800';
            else if (i === selected && i !== q.answer) style = 'bg-red-100 border-2 border-red-400 text-red-700';
            else style = 'bg-white border-2 border-gray-100 text-slate-400 opacity-60';
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} className={`rounded-2xl px-4 py-3 font-black text-sm text-center transition-all shadow-sm ${style}`}>
              {selected !== null && i === q.answer && <span className="mr-1">✅</span>}
              {selected === i && i !== q.answer && <span className="mr-1">❌</span>}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SubjectsPreview() {
  const subjects = [
    { icon: '🇲🇾', name: 'Bahasa Melayu', games: 42, color: 'from-blue-500 to-cyan-400' },
    { icon: '🇬🇧', name: 'English', games: 38, color: 'from-green-500 to-emerald-400' },
    { icon: '🔢', name: 'Matematik', games: 45, color: 'from-purple-500 to-violet-400' },
    { icon: '🧪', name: 'Sains', games: 30, color: 'from-orange-500 to-amber-400' },
    { icon: '🕌', name: 'Jawi', games: 25, color: 'from-teal-500 to-cyan-400' },
    { icon: '🏮', name: 'Mandarin', games: 20, color: 'from-red-500 to-orange-400' },
  ];
  const minis = [
    { icon: '🧠', name: 'Memory Master', desc: 'Latih daya ingatan' },
    { icon: '⚡', name: 'Speed Focus', desc: 'Pantas & tepat' },
    { icon: '🧩', name: 'Logic Puzzles', desc: 'Berfikir kritis' },
    { icon: '🎨', name: 'Creative Builder', desc: 'Kreativiti anak' },
  ];
  return (
    <div className="space-y-5">
      <div>
        <p className="font-black text-slate-900 text-sm mb-3">📚 Games Subjek (KSPK + KSSR)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subjects.map(s => (
            <div key={s.name} className={`rounded-2xl p-3 bg-gradient-to-br ${s.color} text-white shadow`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-black text-sm leading-tight">{s.name}</p>
              <p className="text-white/80 text-xs mt-1">{s.games} games</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="font-black text-slate-900 text-sm mb-3">🎮 Mini Games (Genius Hub)</p>
        <div className="grid grid-cols-2 gap-2">
          {minis.map(m => (
            <div key={m.name} className="rounded-2xl p-3 bg-white border-2 border-purple-100 shadow-sm">
              <div className="text-2xl mb-1">{m.icon}</div>
              <p className="font-black text-slate-900 text-sm">{m.name}</p>
              <p className="text-slate-500 text-xs">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoryKidPreview() {
  const [page, setPage] = useState(0);
  const story = [
    { bg: 'from-sky-400 to-blue-500', scene: '🌲🏡🌸', text: 'Suatu hari, Aqil berjalan ke hutan bersama ayahnya...', choice: null },
    { bg: 'from-green-400 to-emerald-500', scene: '🦊🐦🌿', text: 'Tiba-tiba, seekor rubah kecil terjumpa mereka. Rubah itu nampak lapar.', choice: ['Beri makanan 🍎', 'Teruskan jalan 🚶'] },
    { bg: 'from-yellow-400 to-orange-400', scene: '🦊❤️✨', text: 'Aqil memberi epal kepada rubah. Rubah itu tersenyum dan berterima kasih! Aqil rasa gembira kerana berbuat baik.', choice: null },
  ];
  const s = story[Math.min(page, story.length - 1)];

  return (
    <div className="max-w-md mx-auto">
      <div className={`rounded-3xl bg-gradient-to-br ${s.bg} p-6 text-center text-white shadow-xl mb-4 min-h-[200px] flex flex-col items-center justify-center`}>
        <div className="text-5xl mb-3">{s.scene}</div>
        <p className="font-bold text-lg leading-relaxed">{s.text}</p>
      </div>
      {s.choice ? (
        <div className="grid grid-cols-2 gap-3">
          {s.choice.map((c, i) => (
            <button key={i} onClick={() => setPage(2)} className="py-3 px-4 rounded-2xl bg-white border-2 border-orange-300 text-orange-700 font-black text-sm shadow hover:bg-orange-50 transition-all">
              {c}
            </button>
          ))}
        </div>
      ) : page < story.length - 1 ? (
        <button onClick={() => setPage(p => p + 1)} className="w-full py-3 rounded-2xl bg-white text-blue-700 font-black text-sm shadow border-2 border-blue-200">
          Seterusnya →
        </button>
      ) : (
        <button onClick={() => setPage(0)} className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black text-sm shadow">
          Cuba Cerita Lain 📖
        </button>
      )}
      <p className="text-center text-xs text-slate-500 mt-2">Halaman {Math.min(page + 1, story.length)} / {story.length}</p>
    </div>
  );
}

function ParentDashboardPreview() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-4 text-white">
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-xl">👨‍👩‍👧</div>
        <div>
          <p className="font-black text-sm">Dashboard Ibu Bapa</p>
          <p className="text-white/80 text-xs">Keluarga Ahmad • 2 anak aktif</p>
        </div>
      </div>
      {/* Kids cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Aqil', age: 'Darjah 2', stars: 127, streak: 5, avatar: '🧒' },
          { name: 'Hana', age: 'Prasekolah', stars: 84, streak: 3, avatar: '👧' },
        ].map(k => (
          <div key={k.name} className="bg-white rounded-2xl p-3 border border-purple-100 shadow-sm text-center">
            <div className="text-3xl mb-1">{k.avatar}</div>
            <p className="font-black text-slate-900 text-sm">{k.name}</p>
            <p className="text-slate-500 text-xs">{k.age}</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-center gap-1 text-xs"><span>⭐</span><span className="font-black text-orange-500">{k.stars}</span><span className="text-slate-500">bintang</span></div>
              <div className="flex items-center justify-center gap-1 text-xs"><span>🔥</span><span className="font-black text-red-500">{k.streak}</span><span className="text-slate-500">hari berturut</span></div>
            </div>
          </div>
        ))}
      </div>
      {/* Subject breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
        <p className="font-black text-slate-900 text-sm mb-3">📊 Prestasi Aqil minggu ini</p>
        {[
          { sub: 'BM', score: 85, color: 'bg-blue-500' },
          { sub: 'Math', score: 92, color: 'bg-purple-500' },
          { sub: 'English', score: 70, color: 'bg-green-500' },
          { sub: 'Sains', score: 78, color: 'bg-orange-500' },
        ].map(s => (
          <div key={s.sub} className="flex items-center gap-3 mb-2">
            <span className="text-xs font-black text-slate-600 w-12">{s.sub}</span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-2.5 rounded-full ${s.color}`} style={{ width: `${s.score}%` }} />
            </div>
            <span className="text-xs font-black text-slate-700 w-8 text-right">{s.score}%</span>
          </div>
        ))}
      </div>
      <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
        <p className="text-green-700 font-black text-sm">✅ Laporan mingguan dihantar ke emel ibu bapa setiap Ahad</p>
      </div>
    </div>
  );
}

function ProgressPreview() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Stars & Level */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white text-center shadow-lg">
        <div className="text-4xl mb-1">🧒</div>
        <p className="font-black text-lg">Aqil</p>
        <p className="text-white/80 text-xs mb-3">Darjah 2 • CeriaKid Scholar</p>
        <div className="flex justify-center gap-4">
          <div className="text-center"><p className="font-black text-2xl">127</p><p className="text-white/80 text-xs">Bintang</p></div>
          <div className="text-center"><p className="font-black text-2xl">38</p><p className="text-white/80 text-xs">Games</p></div>
          <div className="text-center"><p className="font-black text-2xl">5🔥</p><p className="text-white/80 text-xs">Streak</p></div>
        </div>
      </div>
      {/* Badges */}
      <div className="bg-white rounded-2xl p-4 border border-yellow-100 shadow-sm">
        <p className="font-black text-slate-900 text-sm mb-3">🏅 Pencapaian Aqil</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { badge: '🏆', name: '10 Games', unlocked: true },
            { badge: '🔥', name: '3 Hari Streak', unlocked: true },
            { badge: '⭐', name: '100 Bintang', unlocked: true },
            { badge: '🧠', name: 'Semua Subjek', unlocked: false },
            { badge: '💎', name: '50 Games', unlocked: false },
            { badge: '👑', name: 'Juara Minggu', unlocked: false },
          ].map((b, i) => (
            <div key={i} className={`rounded-xl p-2 text-center border ${b.unlocked ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
              <div className="text-2xl">{b.badge}</div>
              <p className="text-[10px] font-black text-slate-700 mt-1 leading-tight">{b.name}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Weekly chart */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
        <p className="font-black text-slate-900 text-sm mb-3">📈 Markah 7 Hari Lepas</p>
        <div className="flex items-end gap-1 h-20">
          {[60, 75, 50, 90, 85, 70, 92].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-pink-400" style={{ height: `${v}%` }} />
              <span className="text-[9px] text-slate-400">{'ISNSNRHJSK'[i]}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-1">
          {['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'].map(d => <span key={d}>{d}</span>)}
        </div>
      </div>
    </div>
  );
}

export default function AppPreviewShowcase() {
  const [activeTab, setActiveTab] = useState('game');

  const content = {
    game: <GameSample />,
    subjects: <SubjectsPreview />,
    story: <StoryKidPreview />,
    parent: <ParentDashboardPreview />,
    progress: <ProgressPreview />,
  };

  return (
    <div className="py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
          <span className="inline-block bg-purple-100 text-purple-700 font-black px-4 py-1.5 rounded-full text-sm mb-4 border border-purple-200">👀 TENGOK SENDIRI DULU</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Cuba <span className="text-orange-500">Sebelum Beli</span> — 100% Percuma
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">Ibu bapa boleh tengok sendiri apa yang anak akan dapat. Game sebenar, dashboard ibu bapa, progress tracking — semua ada dalam CeriaKid.</p>
        </motion.div>

        {/* Tab nav — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area — phone mockup style */}
        <div className="relative">
          {/* Decorative phone frame */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-purple-200/60 border border-purple-100 overflow-hidden">
            {/* Mock status bar */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs">🎓</div>
                <span className="text-white font-black text-sm">CeriaKid</span>
              </div>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <span>9:41</span>
                <span>•</span>
                <span>🔋</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-5 min-h-[400px]"
              >
                {content[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating label */}
          <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
            ✅ PREVIEW SEBENAR
          </div>
        </div>

        {/* CTA below */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mt-10">
          <p className="text-slate-600 text-lg mb-4">Anak anda layak dapat yang terbaik. Mulakan hari ini.</p>
          <a href="#pricing" className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-black text-white text-base shadow-xl" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 6px 24px rgba(234,88,12,0.4)' }}>
            🎮 Lihat Pelan Harga →
          </a>
        </motion.div>
      </div>
    </div>
  );
}