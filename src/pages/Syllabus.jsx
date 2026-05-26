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
    <div className="relative min-h-screen">
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
              <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Rujukan Rasmi KPM
              </p>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">Silibus KSPK & KSSR</h1>
            </div>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">
            Rujukan ringkasan kurikulum kebangsaan untuk ibu bapa & cikgu. Boleh pilih mod paparan di bawah.
          </p>
        </motion.div>

        {/* MODE TOGGLE */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-1.5 mb-4 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setMode('parent')}
            className={`py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'parent' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> Mod Ibu Bapa
          </button>
          <button
            onClick={() => setMode('teacher')}
            className={`py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'teacher' ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
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
              isKSPK ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow' : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
            }`}
          >
            🌱 KSPK (Prasekolah)
          </button>
          {KSSR_DARJAH.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveTab(d.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                activeTab === d.id ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow' : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
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
          className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex gap-3 shadow-sm"
        >
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-slate-900 font-black text-sm">{info.fullName}</p>
            <p className="text-slate-700 text-xs leading-snug mt-0.5">
              {info.description}
            </p>
            <p className="text-amber-700 text-[10px] font-bold mt-1.5">
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
              <p className="text-slate-600 text-xs font-black uppercase tracking-widest mb-2">
                🌱 6 Tunjang Pembelajaran KSPK
              </p>
              {KSPK_TUNJANG.map((tunjang) => (
                <SyllabusTopicCard key={tunjang.id} subject={tunjang} mode={mode} />
              ))}
            </>
          ) : (
            <>
              <p className="text-slate-600 text-xs font-black uppercase tracking-widest mb-2">
                📚 {activeDarjah.label} ({activeDarjah.ageRange}) — {activeDarjah.subjects.length} subjek
              </p>
              {activeDarjah.subjects.map((subject) => (
                <SyllabusTopicCard key={subject.id} subject={subject} mode={mode} />
              ))}
            </>
          )}
        </motion.div>

        {/* FOOTER NOTE */}
        <div className="mt-6 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-slate-700 text-xs leading-relaxed">
            <strong className="text-slate-900">Nota:</strong> Maklumat di atas adalah <em>ringkasan rujukan</em> berdasarkan struktur rasmi {SYLLABUS_INFO.source}. Untuk Dokumen Standard Kurikulum & Pentaksiran (DSKP) penuh, sila rujuk laman web rasmi KPM.
          </p>
          <a
            href={SYLLABUS_INFO.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-black text-xs"
          >
            Layari moe.gov.my <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}