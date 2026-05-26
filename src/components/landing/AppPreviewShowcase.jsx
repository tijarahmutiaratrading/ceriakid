import React, { useState } from 'react';
import { motion } from 'framer-motion';

// ── GAME SAMPLE ──
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
    <div className="flex flex-col items-center justify-center py-8 gap-4 mx-auto">
      <div className="text-6xl">🏆</div>
      <h3 className="font-black text-2xl text-slate-900">Tahniah! 🎉</h3>
      <p className="text-lg font-bold text-slate-700">Markah: <span className="text-orange-500">{score}/{questions.length}</span></p>
      <div className="flex gap-1">{[...Array(questions.length)].map((_, i) => <span key={i} className="text-2xl">{i < score ? '⭐' : '☆'}</span>)}</div>
      <button onClick={reset} className="mt-2 px-6 py-3 rounded-full bg-orange-500 text-white font-black text-sm shadow-lg">Cuba Lagi!</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="flex items-center justify-between mb-3 justify-center">
        <span className="text-xs font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{q.subject}</span>
        <span className="text-xs font-bold text-slate-500">Soalan {qIdx + 1} / {questions.length}</span>
        <span className="text-xs font-black text-orange-500">⭐ {score} mata</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${(qIdx / questions.length) * 100}%` }} />
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 mb-4 border border-purple-100 text-center mx-auto">
        <p className="font-black text-slate-900 text-lg leading-snug">{q.q}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mx-auto">
         {q.options.map((opt, i) => {
          let cls = 'bg-white border-2 border-gray-200 text-slate-800 hover:border-orange-400 hover:bg-orange-50';
          if (selected !== null) {
            if (i === q.answer) cls = 'bg-green-100 border-2 border-green-500 text-green-800';
            else if (i === selected) cls = 'bg-red-100 border-2 border-red-400 text-red-700';
            else cls = 'bg-white border-2 border-gray-100 text-slate-400 opacity-50';
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} className={`rounded-2xl px-4 py-3 font-black text-sm text-center transition-all shadow-sm ${cls}`}>
              {selected !== null && i === q.answer && '✅ '}{selected === i && i !== q.answer && '❌ '}{opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── STORY KID ── (match real /story-kid page)
function StoryKidPreview() {
  const [page, setPage] = useState(0);
  const [stars, setStars] = useState(0);
  const story = {
    title: 'Ali Tolong Kucing',
    cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f57f9479f_generated_image.png',
    scenes: [
      { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0a97ddf90_generated_image.png', text: 'Ali balik dari sekolah dan terdengar bunyi kucing kecil.', choices: ['Cari bunyi itu', 'Terus balik rumah'] },
      { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3ff2b9379_generated_image.png', text: 'Ali nampak anak kucing tersepit di tepi longkang.', choices: ['Panggil orang dewasa', 'Tarik sendiri kuat-kuat'] },
      { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f4b720a6a_generated_image.png', text: 'Cikgu datang dan menyelamatkan anak kucing dengan selamat!', choices: ['Tamat cerita 🏆'] },
    ],
  };
  const s = story.scenes[Math.min(page, story.scenes.length - 1)];
  const progress = ((page + 1) / story.scenes.length) * 100;

  const handleChoice = (i) => {
    if (i === 0) setStars(st => st + 1);
    if (page >= story.scenes.length - 1) { setPage(0); setStars(0); }
    else setPage(p => p + 1);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Mini header — match real story header */}
      <div className="flex items-center gap-2 mb-3 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-3 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm truncate">{story.title}</p>
          <div className="h-2 bg-white/20 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-300 to-pink-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-yellow-300 text-yellow-950 font-black text-xs flex-shrink-0">{stars} ⭐</div>
      </div>

      {/* Scene card — image + text + choices, sama macam real */}
      <div className="rounded-3xl bg-white shadow-xl border-2 border-purple-100 p-2.5 mb-3">
        <div className="relative h-44 rounded-2xl overflow-hidden ring-2 ring-purple-100 shadow-md mb-3">
          <img src={s.img} alt={s.text} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 text-purple-700 text-[10px] font-black shadow">Halaman {page + 1} / {story.scenes.length}</div>
        </div>
        <div className="rounded-2xl bg-purple-50 border border-purple-100 px-3 py-2.5 mb-3">
          <p className="text-purple-800 text-sm font-black text-center leading-snug">{s.text}</p>
        </div>
        <div className={`grid gap-2 ${s.choices.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {s.choices.map((c, i) => (
            <button key={i} onClick={() => handleChoice(i)} className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xs shadow-md hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-between gap-2">
              <span className="truncate">{c}</span>
              <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PARENT DASHBOARD ──
function ParentDashboardPreview() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-4 text-white">
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-xl">👨‍👩‍👧</div>
        <div>
          <p className="font-black text-sm">Dashboard Ibu Bapa</p>
          <p className="text-white/80 text-xs">Keluarga Ahmad • 2 anak aktif</p>
        </div>
      </div>
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
      <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
        <p className="font-black text-slate-900 text-sm mb-3 text-center">📊 Prestasi Aqil minggu ini</p>
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

// ── PROGRESS / ACHIEVEMENTS ──
function ProgressPreview() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white text-center shadow-lg">
        <div className="text-4xl mb-1">🧒</div>
        <p className="font-black text-lg">Aqil</p>
        <p className="text-white/80 text-xs mb-3">Darjah 2 • CeriaKid Scholar</p>
        <div className="flex justify-center gap-6">
          <div className="text-center"><p className="font-black text-2xl">127</p><p className="text-white/80 text-xs">Bintang</p></div>
          <div className="text-center"><p className="font-black text-2xl">38</p><p className="text-white/80 text-xs">Games</p></div>
          <div className="text-center"><p className="font-black text-2xl">5🔥</p><p className="text-white/80 text-xs">Streak</p></div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-yellow-100 shadow-sm">
        <p className="font-black text-slate-900 text-sm mb-3 text-center">🏅 Pencapaian</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { badge: '🏆', name: '10 Games', unlocked: true },
            { badge: '🔥', name: '3 Hari Streak', unlocked: true },
            { badge: '⭐', name: '100 Bintang', unlocked: true },
            { badge: '🧠', name: 'Semua Subjek', unlocked: false },
            { badge: '💎', name: '50 Games', unlocked: false },
            { badge: '👑', name: 'Juara Minggu', unlocked: false },
          ].map((b, i) => (
            <div key={i} className={`rounded-xl p-2 text-center border ${b.unlocked ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-40'}`}>
              <div className="text-2xl">{b.badge}</div>
              <p className="text-[10px] font-black text-slate-700 mt-1 leading-tight">{b.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
        <p className="font-black text-slate-900 text-sm mb-3 text-center">📈 Markah 7 Hari Lepas</p>
        <div className="flex items-end gap-1.5 h-20">
          {[60, 75, 50, 90, 85, 70, 92].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-pink-400 transition-all" style={{ height: `${v}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-0.5">
          {['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'].map(d => <span key={d}>{d}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── SECTION WRAPPER ──
function Section({ number, badge, badgeColor, title, desc, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mb-16 md:mb-20"
    >
      {/* Section label */}
       <div className="flex items-center justify-center gap-3 mb-5">
         <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm shadow-md ${badgeColor}`}>{number}</div>
         <span className={`inline-block font-black px-4 py-1.5 rounded-full text-sm border ${badge}`}>{title}</span>
       </div>
       <p className="text-slate-600 mb-6 max-w-xl text-center mx-auto">{desc}</p>

      {/* Phone frame */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-orange-200/60 border border-orange-100 overflow-hidden max-w-lg mx-auto">
        {/* Mock header bar */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">🎓</div>
            <span className="text-white font-black text-sm">CeriaKid</span>
          </div>
          <span className="text-white/70 text-xs">9:41 🔋</span>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </motion.div>
  );
}

export default function AppPreviewShowcase() {
  return (
    <div className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-slate-900">
      <div className="absolute top-10 -left-32 w-96 h-96 rounded-full bg-orange-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 rounded-full bg-pink-300/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Intro — Perkenalkan CeriaKid */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-md mb-5">
            <span>✅</span>
            <span className="text-emerald-700 text-xs sm:text-sm font-bold">SOLUSI SCREEN TIME BERFAEDAH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4">
            Perkenalkan CeriaKid —{' '}
            <span className="bg-gradient-to-r from-orange-600 via-pink-500 to-red-500 bg-clip-text text-transparent">latihan harian yang anak suka</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Permainan edukatif berasaskan topik sekolah Malaysia. Anak rasa macam main game, ibu bapa pula nampak perkembangan pembelajaran.
          </p>
        </motion.div>

        {/* 3 feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { icon: '🎮', title: 'Latihan Rasa Macam Game', desc: 'Soalan pendek, warna ceria dan feedback segera bantu anak kekal fokus tanpa rasa terbeban.' },
            { icon: '📊', title: 'Ibu Bapa Boleh Pantau', desc: 'Lihat markah, percubaan dan topik yang anak perlukan lebih latihan melalui dashboard.' },
            { icon: '📲', title: 'Sesuai Untuk Rutin Harian', desc: 'Gunakan 5–10 minit sehari di rumah, dalam kereta atau bila anak ada masa lapang.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-3xl p-6 sm:p-7 bg-white shadow-xl shadow-orange-100 border border-orange-100 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="font-black text-slate-900 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Showcase heading */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-400/30 backdrop-blur-md mb-5">
            <span>👀</span>
            <span className="text-orange-700 text-xs sm:text-sm font-bold">TENGOK SENDIRI DULU</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4">
            Cuba <span className="bg-gradient-to-r from-orange-600 via-pink-500 to-red-500 bg-clip-text text-transparent">sebelum beli</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">Scroll ke bawah — tengok sendiri apa yang anak dan ibu bapa akan dapat dalam CeriaKid.</p>
        </motion.div>

        {/* 1. Game Sample */}
        <Section
          number="1"
          badgeColor="bg-orange-500"
          badge="bg-orange-50 text-orange-700 border-orange-200"
          title="🎮 Cuba Main Game — Sekarang!"
          desc="Ini adalah game sebenar dalam CeriaKid. Anak boleh jawab soalan dari pelbagai subjek, dapat bintang dan tengok markah mereka."
        >
          <GameSample />
        </Section>

        {/* 2. Subjek & Mini Games */}
        <Section
          number="2"
          badgeColor="bg-blue-500"
          badge="bg-blue-50 text-blue-700 border-blue-200"
          title="📚 Subjek & Mini Games"
          desc="7 subjek utama ikut KSPK + KSSR, ditambah dengan Mini Games seru untuk latih kemahiran berfikir."
        >
          <div className="space-y-5">
            <div>
              <p className="font-black text-slate-800 text-sm mb-3 text-center">📚 Games Subjek (KSPK + KSSR)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { icon: '🇲🇾', name: 'Bahasa Melayu', games: 42, color: 'from-blue-500 to-cyan-400' },
                  { icon: '🇬🇧', name: 'English', games: 38, color: 'from-green-500 to-emerald-400' },
                  { icon: '🔢', name: 'Matematik', games: 45, color: 'from-purple-500 to-violet-400' },
                  { icon: '🧪', name: 'Sains', games: 30, color: 'from-orange-500 to-amber-400' },
                  { icon: '🕌', name: 'Jawi', games: 25, color: 'from-teal-500 to-cyan-400' },
                  { icon: '🏮', name: 'Mandarin', games: 20, color: 'from-red-500 to-orange-400' },
                ].map(s => (
                  <div key={s.name} className={`rounded-2xl p-3 bg-gradient-to-br ${s.color} text-white shadow`}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="font-black text-sm leading-tight">{s.name}</p>
                    <p className="text-white/80 text-xs mt-0.5">{s.games}+ games</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm mb-3 text-center">🎮 Mini Games (Genius Hub)</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '🧠', name: 'Memory Master', desc: 'Latih daya ingatan' },
                  { icon: '⚡', name: 'Speed Focus', desc: 'Pantas & tepat' },
                  { icon: '🧩', name: 'Logic Puzzles', desc: 'Berfikir kritis' },
                  { icon: '🎨', name: 'Creative Builder', desc: 'Kreativiti anak' },
                ].map(m => (
                  <div key={m.name} className="rounded-2xl p-3 bg-white border-2 border-purple-100 shadow-sm">
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <p className="font-black text-slate-900 text-sm">{m.name}</p>
                    <p className="text-slate-500 text-xs">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 3. Story Kid */}
        <Section
          number="3"
          badgeColor="bg-emerald-500"
          badge="bg-emerald-50 text-emerald-700 border-emerald-200"
          title="📖 Story Kid — Cerita Interaktif"
          desc="Anak baca cerita pendek bergambar dan buat pilihan sendiri. Setiap pilihan bawa pelajaran nilai murni."
        >
          <StoryKidPreview />
        </Section>

        {/* 4. Dashboard Ibu Bapa */}
        <Section
          number="4"
          badgeColor="bg-purple-500"
          badge="bg-purple-50 text-purple-700 border-purple-200"
          title="📊 Dashboard Ibu Bapa"
          desc="Pantau prestasi semua anak dalam satu tempat. Tengok subjek mana yang perlu lebih latihan."
        >
          <ParentDashboardPreview />
        </Section>

        {/* 5. Prestasi Anak */}
        <Section
          number="5"
          badgeColor="bg-yellow-500"
          badge="bg-yellow-50 text-yellow-700 border-yellow-200"
          title="🏆 Prestasi & Pencapaian Anak"
          desc="Setiap game yang siap bawa bintang dan badge. Anak rasa bangga, ibu bapa pula boleh pantau kemajuan dari masa ke masa."
        >
          <ProgressPreview />
        </Section>

        {/* Final CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-4">
          <p className="text-slate-700 text-base sm:text-lg mb-5 font-semibold">Dah tengok semuanya? Mulakan hari ini 👇</p>
          <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-white text-base shadow-xl" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 6px 24px rgba(234,88,12,0.4)' }}>
            🎮 Lihat Pelan Harga →
          </a>
        </motion.div>

      </div>
    </div>
  );
}