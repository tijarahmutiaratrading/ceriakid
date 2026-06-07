import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookMarked, ExternalLink, Info, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import SyllabusTopicCard from '@/components/syllabus/SyllabusTopicCard';
import { KSPK_TUNJANG, KSSR_DARJAH, SYLLABUS_INFO } from '@/lib/syllabusData';

export default function Syllabus() {
  const [mode, setMode] = useState('parent'); // 'parent' | 'teacher'
  const [activeTab, setActiveTab] = useState('kspk'); // 'kspk' | 'darjah_1..6'

  const isKSPK = activeTab === 'kspk';
  const activeDarjah = !isKSPK ? KSSR_DARJAH.find((d) => d.id === activeTab) : null;
  const info = isKSPK ? SYLLABUS_INFO.kspk : SYLLABUS_INFO.kssr;

  return (
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      {/* Override AppLayout background image */}
      <div aria-hidden="true" className="pointer-events-none" style={{ position: 'fixed', inset: 0, zIndex: -1, background: '#fafafa' }} />
      <div className="md:hidden">
        <AppHeader showBack={true} backTo="/dashboard" title="Silibus KSPK & KSSR" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 md:pt-6 pb-16">
        {/* Back button */}
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
            style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <BookMarked className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Silibus KSPK & KSSR</h1>
              <p className="text-xs text-slate-500 font-medium">Rujukan rasmi KPM untuk ibu bapa & cikgu</p>
            </div>
          </div>
        </motion.div>

        {/* MODE TOGGLE */}
        <div className="rounded-xl p-1 mb-4 grid grid-cols-2 gap-1" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <button
            onClick={() => setMode('parent')}
            className={`py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'parent' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" /> Mod Ibu Bapa
          </button>
          <button
            onClick={() => setMode('teacher')}
            className={`py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'teacher' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Mod Cikgu
          </button>
        </div>

        {/* LEVEL TABS */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setActiveTab('kspk')}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
              isKSPK ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 border border-white/80 hover:bg-white/80'
            }`}
            style={!isKSPK ? { background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(10px)' } : {}}
          >
            🌱 KSPK
          </button>
          {KSSR_DARJAH.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveTab(d.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === d.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 border border-white/80 hover:bg-white/80'
              }`}
              style={activeTab !== d.id ? { background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(10px)' } : {}}
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
          className="rounded-xl p-3.5 mb-4 flex gap-3"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-slate-900 font-bold text-sm">{info.fullName}</p>
            <p className="text-slate-500 text-xs leading-snug mt-0.5">{info.description}</p>
            <p className="text-amber-600 text-[10px] font-semibold mt-1">
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
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                6 Tunjang Pembelajaran KSPK
              </p>
              {KSPK_TUNJANG.map((tunjang) => (
                <SyllabusTopicCard key={tunjang.id} subject={tunjang} mode={mode} />
              ))}
            </>
          ) : (
            <>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                {activeDarjah.label} ({activeDarjah.ageRange}) — {activeDarjah.subjects.length} subjek
              </p>
              {activeDarjah.subjects.map((subject) => (
                <SyllabusTopicCard key={subject.id} subject={subject} mode={mode} />
              ))}
            </>
          )}
        </motion.div>

        {/* FOOTER NOTE */}
        <div className="mt-6 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <p className="text-slate-500 text-xs leading-relaxed">
            <strong className="text-slate-700">Nota:</strong> Maklumat di atas adalah <em>ringkasan rujukan</em> berdasarkan struktur rasmi {SYLLABUS_INFO.source}. Untuk DSKP penuh, sila rujuk laman web rasmi KPM.
          </p>
          <a
            href={SYLLABUS_INFO.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold text-xs"
          >
            Layari moe.gov.my <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}