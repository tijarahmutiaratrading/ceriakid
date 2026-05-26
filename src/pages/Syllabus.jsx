import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookMarked, ExternalLink, Info, Sparkles } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import AIBackButton from '@/components/ai/AIBackButton';
import SyllabusTopicCard from '@/components/syllabus/SyllabusTopicCard';
import { KSPK_TUNJANG, KSSR_DARJAH, SYLLABUS_INFO } from '@/lib/syllabusData';

export default function Syllabus() {
  const [mode, setMode] = useState('parent'); // 'parent' | 'teacher'
  const [activeTab, setActiveTab] = useState('kspk'); // 'kspk' | 'darjah_1..6'

  const isKSPK = activeTab === 'kspk';
  const activeDarjah = !isKSPK ? KSSR_DARJAH.find((d) => d.id === activeTab) : null;
  const info = isKSPK ? SYLLABUS_INFO.kspk : SYLLABUS_INFO.kssr;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #312e81 70%, #4c1d95 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-indigo-500/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] bg-purple-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-violet-500/30 rounded-full blur-3xl" />
      </div>

      <div className="md:hidden">
        <AppHeader showBack={true} backTo="/dashboard" title="Silibus KSPK & KSSR" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 pt-24 md:pt-6 pb-16">
        <div className="mb-4">
          <AIBackButton to="/dashboard" label="Kembali ke Dashboard" />
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <BookMarked className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Rujukan Rasmi KPM
              </p>
              <h1 className="text-xl md:text-2xl font-black text-white">Silibus KSPK & KSSR</h1>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Rujukan ringkasan kurikulum kebangsaan untuk ibu bapa & cikgu. Boleh pilih mod paparan di bawah.
          </p>
        </motion.div>

        {/* MODE TOGGLE */}
        <div className="pro-glass rounded-2xl p-1.5 mb-4 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setMode('parent')}
            className={`py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'parent' ? 'bg-white text-purple-700 shadow' : 'text-white hover:bg-white/15'
            }`}
          >
            <Users className="w-4 h-4" /> Mod Ibu Bapa
          </button>
          <button
            onClick={() => setMode('teacher')}
            className={`py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'teacher' ? 'bg-white text-purple-700 shadow' : 'text-white hover:bg-white/15'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Mod Cikgu
          </button>
        </div>

        {/* LEVEL TABS */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          <button
            onClick={() => setActiveTab('kspk')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-black text-xs transition-all ${
              isKSPK ? 'bg-white text-purple-700 shadow' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🌱 KSPK (Prasekolah)
          </button>
          {KSSR_DARJAH.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveTab(d.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                activeTab === d.id ? 'bg-white text-purple-700 shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* INFO BANNER */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-400/15 border border-amber-300/30 rounded-2xl p-3 mb-4 flex gap-3"
        >
          <Info className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-white font-black text-sm">{info.fullName}</p>
            <p className="text-white/70 text-xs leading-snug mt-0.5">
              {info.description}
            </p>
            <p className="text-amber-200 text-[10px] font-bold mt-1.5">
              📅 {info.lastUpdated} • Untuk umur {info.forAge}
            </p>
          </div>
        </motion.div>

        {/* CONTENT */}
        <motion.div
          key={`${activeTab}-${mode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {isKSPK ? (
            <>
              <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-2">
                🌱 6 Tunjang Pembelajaran KSPK
              </p>
              {KSPK_TUNJANG.map((tunjang) => (
                <SyllabusTopicCard key={tunjang.id} subject={tunjang} mode={mode} />
              ))}
            </>
          ) : (
            <>
              <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-2">
                📚 {activeDarjah.label} ({activeDarjah.ageRange}) — {activeDarjah.subjects.length} subjek
              </p>
              {activeDarjah.subjects.map((subject) => (
                <SyllabusTopicCard key={subject.id} subject={subject} mode={mode} />
              ))}
            </>
          )}
        </motion.div>

        {/* FOOTER NOTE */}
        <div className="mt-6 pro-glass rounded-2xl p-4">
          <p className="text-white/70 text-xs leading-relaxed">
            <strong className="text-white">Nota:</strong> Maklumat di atas adalah <em>ringkasan rujukan</em> berdasarkan struktur rasmi {SYLLABUS_INFO.source}. Untuk Dokumen Standard Kurikulum & Pentaksiran (DSKP) penuh, sila rujuk laman web rasmi KPM.
          </p>
          <a
            href={SYLLABUS_INFO.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-black text-xs"
          >
            Layari moe.gov.my <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}