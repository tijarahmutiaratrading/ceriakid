import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Image, Languages, LayoutTemplate, Loader2, Moon, Wand2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { base44 } from '@/api/base44Client';
import PremiumBBMPreview from '@/components/bbm/PremiumBBMPreview';
import { BBM_TYPES, GENERATION_MODES, SCHOOL_LEVELS, SUBJECTS, VISUAL_STYLES, getLabel, getSubjectEmoji } from '@/lib/bbmGeneratorOptions';

const defaultForm = {
  mode: 'smart', subject: 'bahasa_melayu', level: 'darjah_4', type: 'lembaran_kerja', topic: '', studentLevel: 'sederhana', objective: '', duration: '40 minit', style: 'canva', language: 'bm', sections: 6,
};

export default function AIBBMGenerator() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [saved, setSaved] = useState(false);

  const selectedStyle = VISUAL_STYLES.find(style => style.id === form.style) || VISUAL_STYLES[0];
  const title = generated?.title || `${getSubjectEmoji(form.subject)} ${getLabel(BBM_TYPES, form.type)} ${form.topic || ''}`.trim();

  const canGenerate = form.topic.trim().length > 2 || form.mode === 'quick';

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setSaved(false);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Anda ialah professional instructional designer Malaysia dan premium Canva/Twinkl educational creator.

Bina SATU BBM classroom-ready yang nampak premium, moden, visual-heavy dan unik.

Input guru:
- Mode: ${getLabel(GENERATION_MODES, form.mode)}
- Subjek: ${getLabel(SUBJECTS, form.subject)}
- Tahap: ${getLabel(SCHOOL_LEVELS, form.level)}
- Jenis BBM: ${getLabel(BBM_TYPES, form.type)}
- Topik: ${form.topic || 'topik asas mengikut silibus'}
- Tahap murid: ${form.studentLevel}
- Objective guru: ${form.objective || 'AI cadangkan objektif sesuai'}
- Masa kelas: ${form.duration}
- Bahasa output: ${form.language === 'en' ? 'English' : form.language === 'dual' ? 'Bahasa Melayu + English bilingual' : 'Bahasa Melayu Malaysia baku'}
- Style visual: ${selectedStyle.label}, palette ${selectedStyle.colors.join(', ')}

WAJIB hasilkan BBM yang:
1. Tidak nampak template murah, bukan Word style, bukan worksheet kosong putih biasa.
2. Visual-heavy: ada mascot/ikon/illustration descriptions, premium cards, section divider, gradient, badge, sticker reward.
3. Ada visual hierarchy jelas: hero header, objective card, teacher guide, student activity, interactive element, reward/gamification, answer scheme jika sesuai.
4. Setiap layout mesti unik dan dynamic ikut mode/type, bukan template sama.
5. Sesuai murid Malaysia, classroom-ready, printable A4, mobile-preview friendly.
6. Jangan terlalu banyak text; gunakan cards, chips, table visual, callout, mini infographic.
7. Jika exam mode, sertakan KBAT + marking scheme. Jika game mode, sertakan gameplay rules + scoring. Jika presentation mode, susun sebagai slide cards.
8. Semua content mesti siap guna, bukan placeholder.

Pulangkan JSON sahaja dengan schema:
{
  title, description, learningObjective, difficulty, estimatedDuration, visualTheme, mascot, interactiveElement, rewardSystem, teacherInstruction, studentActivity, answerScheme, tags[], htmlContent
}

htmlContent mesti full inner HTML sahaja untuk bahan A4, dengan inline CSS lengkap dalam <style>. Design mesti premium: gradient lembut, rounded cards, icons emoji, modern typography fallback, colored dividers, print friendly, no external assets.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' }, description: { type: 'string' }, learningObjective: { type: 'string' }, difficulty: { type: 'string' }, estimatedDuration: { type: 'string' }, visualTheme: { type: 'string' }, mascot: { type: 'string' }, interactiveElement: { type: 'string' }, rewardSystem: { type: 'string' }, teacherInstruction: { type: 'string' }, studentActivity: { type: 'string' }, answerScheme: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } }, htmlContent: { type: 'string' },
        },
        required: ['title', 'description', 'learningObjective', 'difficulty', 'estimatedDuration', 'interactiveElement', 'rewardSystem', 'teacherInstruction', 'studentActivity', 'htmlContent'],
      },
    });

    setGenerated(res);
    setLoading(false);
  };

  const save = async () => {
    if (!generated) return;
    await base44.entities.BBMResource.create({
      title: generated.title,
      description: generated.description,
      subject: form.subject,
      level: form.level,
      type: form.type,
      emoji: getSubjectEmoji(form.subject),
      htmlContent: generated.htmlContent,
      tags: generated.tags || [form.topic, form.mode, selectedStyle.label].filter(Boolean),
      tier: 'premium',
      downloadCount: 0,
      isPublished: true,
    });
    setSaved(true);
  };

  const printPreview = () => {
    if (!generated?.htmlContent) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${generated.title}</title></head><body>${generated.htmlContent}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const featureCards = [
    { icon: Image, label: 'Visual-heavy', text: 'Premium cards, ikon, mascot dan divider moden.' },
    { icon: LayoutTemplate, label: 'Non-repetitive', text: 'AI diminta hasilkan struktur layout berbeza setiap kali.' },
    { icon: Languages, label: 'BM / EN', text: 'Sokong BM, English dan bilingual.' },
    { icon: Moon, label: 'Classroom-ready', text: 'Ada objektif, aktiviti, arahan guru dan skema.' },
  ];

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)', backgroundSize: '26px 26px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-400 blur-3xl opacity-20" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-fuchsia-500 blur-3xl opacity-20" />
      </div>

      <AppHeader showBack={true} backTo="/bbm" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-32 pt-28 md:pt-32">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-[2rem] p-5 md:p-7 border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/20">
          <Link to="/bbm" className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/90 text-purple-700 font-black text-xs shadow-lg"><ArrowLeft className="w-4 h-4" /> Kembali ke BBM Hub</Link>
          <div className="grid lg:grid-cols-[1fr_auto] gap-5 items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-300/15 border border-cyan-200/20 text-cyan-100 text-xs font-black uppercase tracking-wider mb-3">✨ AI BBM Generator Platform</div>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">Generate BBM Premium untuk Prasekolah & Sekolah Rendah</h1>
              <p className="text-white/70 mt-3 max-w-2xl">Worksheet, slides, kuiz, flashcard, infografik, PBD, STEM, KBAT dan teaching kit untuk guru prasekolah hingga Darjah 6.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 md:w-96">
              {featureCards.map(({ icon: Icon, label, text }) => <div key={label} className="rounded-2xl bg-white/10 border border-white/15 p-3"><Icon className="w-4 h-4 text-cyan-200 mb-2" /><p className="text-white text-xs font-black">{label}</p><p className="text-white/55 text-[10px] leading-snug">{text}</p></div>)}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[25rem_1fr] gap-5">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[2rem] p-5 bg-white/10 border border-white/20 backdrop-blur-2xl shadow-2xl shadow-black/20 h-fit">
            <Field label="AI Generation Mode">
              <div className="grid grid-cols-1 gap-2">{GENERATION_MODES.map(mode => <button key={mode.id} onClick={() => setForm(f => ({ ...f, mode: mode.id }))} className={`text-left p-3 rounded-2xl border transition-all ${form.mode === mode.id ? 'bg-white text-indigo-900 border-white shadow-lg' : 'bg-white/8 text-white border-white/10 hover:bg-white/15'}`}><p className="font-black text-sm">{mode.emoji} {mode.label}</p><p className="text-xs opacity-70">{mode.description}</p></button>)}</div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Select label="Subjek" value={form.subject} onChange={value => setForm(f => ({ ...f, subject: value }))} options={SUBJECTS.map(s => ({ value: s.value, label: `${s.emoji} ${s.label}` }))} />
              <Select label="Tahap" value={form.level} onChange={value => setForm(f => ({ ...f, level: value }))} options={SCHOOL_LEVELS} />
            </div>
            <Select label="Jenis BBM" value={form.type} onChange={value => setForm(f => ({ ...f, type: value }))} options={BBM_TYPES} />
            <Input label="Topik" value={form.topic} onChange={value => setForm(f => ({ ...f, topic: value }))} placeholder="cth: Fotosintesis, Karangan Fakta, Linear Equations" />
            <Input label="Learning Objective" value={form.objective} onChange={value => setForm(f => ({ ...f, objective: value }))} placeholder="cth: Murid dapat mengenal pasti..." />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Tahap Murid" value={form.studentLevel} onChange={value => setForm(f => ({ ...f, studentLevel: value }))} options={[{ value: 'lemah', label: 'Lemah' }, { value: 'sederhana', label: 'Sederhana' }, { value: 'cemerlang', label: 'Cemerlang' }]} />
              <Select label="Bahasa" value={form.language} onChange={value => setForm(f => ({ ...f, language: value }))} options={[{ value: 'bm', label: 'Bahasa Melayu' }, { value: 'en', label: 'English' }, { value: 'dual', label: 'Bilingual' }]} />
            </div>
            <Input label="Masa Kelas" value={form.duration} onChange={value => setForm(f => ({ ...f, duration: value }))} placeholder="40 minit" />

            <Field label="Design Style">
              <div className="grid grid-cols-1 gap-2">{VISUAL_STYLES.map(style => <button key={style.id} onClick={() => setForm(f => ({ ...f, style: style.id }))} className={`p-3 rounded-2xl border text-left transition-all ${form.style === style.id ? 'bg-white text-indigo-900 border-white' : 'bg-white/8 text-white border-white/10'}`}><div className="flex items-center justify-between gap-2"><p className="font-black text-sm">{style.label}</p><div className="flex -space-x-1">{style.colors.map(color => <span key={color} className="w-4 h-4 rounded-full border border-white/70" style={{ background: color }} />)}</div></div></button>)}</div>
            </Field>

            <motion.button whileTap={{ scale: 0.97 }} disabled={!canGenerate || loading} onClick={generate} className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-500 text-white font-black shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Wand2 className="w-5 h-5" /> Generate Premium BBM</>}
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <PremiumBBMPreview html={generated?.htmlContent} title={title} loading={loading} onPrint={printPreview} onSave={save} saved={saved} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="mb-4"><p className="text-white/70 text-[11px] font-black uppercase tracking-wider mb-2">{label}</p>{children}</div>;
}

function Select({ label, value, onChange, options }) {
  return <Field label={label}><select value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-2xl bg-white/10 border border-white/20 text-white px-3 py-3 text-sm font-bold outline-none"><option className="text-black" value="">Pilih</option>{options.map(option => <option key={option.value} value={option.value} className="text-black">{option.label}</option>)}</select></Field>;
}

function Input({ label, value, onChange, placeholder }) {
  return <Field label={label}><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/35 px-3 py-3 text-sm font-bold outline-none focus:bg-white/15" /></Field>;
}