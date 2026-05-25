import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Loader2, RefreshCw, Trophy, ArrowRight, Zap } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import AIBackButton from '@/components/ai/AIBackButton';
import CreditBalanceWidget from '@/components/credits/CreditBalanceWidget';
import QuizQuestionCard from '@/components/ai/QuizQuestionCard';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const SUBJECTS = [
  { value: 'mathematics', label: 'Matematik', emoji: '🔢' },
  { value: 'bahasa_melayu', label: 'BM', emoji: '🇲🇾' },
  { value: 'english', label: 'English', emoji: '🇬🇧' },
  { value: 'science', label: 'Sains', emoji: '🔬' },
  { value: 'jawi', label: 'Jawi', emoji: '✍️' },
  { value: 'general', label: 'Umum', emoji: '💡' },
];

const LEVELS = [
  { value: 'prasekolah', label: 'Prasekolah' },
  { value: 'darjah_1', label: 'Darjah 1' },
  { value: 'darjah_2', label: 'Darjah 2' },
  { value: 'darjah_3', label: 'Darjah 3' },
  { value: 'darjah_4', label: 'Darjah 4' },
  { value: 'darjah_5', label: 'Darjah 5' },
  { value: 'darjah_6', label: 'Darjah 6' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Mudah', emoji: '😊' },
  { value: 'medium', label: 'Sederhana', emoji: '🎯' },
  { value: 'hard', label: 'Mencabar', emoji: '🔥' },
];

export default function QuizAI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState('mathematics');
  const [level, setLevel] = useState('darjah_3');
  const [difficulty, setDifficulty] = useState('medium');
  const [topic, setTopic] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const generateQuiz = async () => {
    if (loading) return;
    setLoading(true);
    setInsufficientCredits(false);

    try {
      const res = await base44.functions.invoke('generateQuizQuestion', {
        subject,
        level,
        topic: topic.trim() || null,
        difficulty,
        askedQuestions,
        childName: user?.full_name?.split(' ')[0] || '',
      });

      if (res.data?.error === 'INSUFFICIENT_CREDITS') {
        setInsufficientCredits(true);
        toast({ title: 'Kredit habis', description: 'Sila top up untuk teruskan main kuiz.', variant: 'destructive' });
      } else if (res.data?.success && res.data?.quiz) {
        setCurrentQuiz(res.data.quiz);
        setAskedQuestions(prev => [...prev, res.data.quiz.question]);
      } else {
        throw new Error(res.data?.error || 'Ralat tidak diketahui');
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e.message;
      toast({ title: 'Ralat', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswered = ({ isCorrect }) => {
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleReset = () => {
    setCurrentQuiz(null);
    setAskedQuestions([]);
    setScore({ correct: 0, total: 0 });
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #312e81 70%, #4c1d95 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-indigo-500/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] bg-cyan-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-violet-500/30 rounded-full blur-3xl" />
      </div>

      <div className="md:hidden">
        <AppHeader showBack={true} backTo="/dashboard" title="Kuiz AI" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 pt-24 md:pt-6 pb-16">
        <div className="mb-4">
          <AIBackButton to="/dashboard" label="Kembali ke Dashboard" />
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Kuiz Interaktif
              </p>
              <h1 className="text-xl md:text-2xl font-black text-white">Kuiz AI</h1>
            </div>
          </div>
          <CreditBalanceWidget compact />
        </motion.div>

        {/* Score badge (kalau dah main) */}
        {score.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 pro-glass rounded-2xl p-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Skor anda</p>
                <p className="text-white font-black text-base">{score.correct} / {score.total} betul ({accuracy}%)</p>
              </div>
            </div>
            <button onClick={handleReset} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </motion.div>
        )}

        {/* Setup card — paparkan kalau tiada quiz aktif */}
        {!currentQuiz && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pro-glass rounded-3xl p-5 mb-4 space-y-4">
            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">📚 Subjek</p>
              <div className="grid grid-cols-3 gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSubject(s.value)}
                    className={`px-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                      subject === s.value ? 'bg-white text-indigo-700 shadow' : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    <div className="text-base mb-0.5">{s.emoji}</div>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">🎓 Tahap</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {LEVELS.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      level === l.value ? 'bg-white text-indigo-700 shadow' : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">⚡ Tahap Kesukaran</p>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`px-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                      difficulty === d.value ? 'bg-white text-indigo-700 shadow' : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    <div className="text-base mb-0.5">{d.emoji}</div>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">🎯 Topik Khusus <span className="opacity-60">(opsyenal)</span></p>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Contoh: Pecahan, Haiwan, Imbuhan..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:bg-white/20"
              />
            </div>

            <button
              onClick={generateQuiz}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-black text-base shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-2xl transition-all"
            >
              <Zap className="w-5 h-5" /> Mula Kuiz <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-white/50 text-[10px] font-semibold">
              💰 1 kredit setiap soalan
            </p>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pro-glass rounded-3xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mx-auto mb-3" />
            <p className="text-white font-black text-base">AI sedang jana soalan...</p>
            <p className="text-white/60 text-xs mt-1">Sila tunggu sebentar 🎯</p>
          </motion.div>
        )}

        {/* Active quiz */}
        <AnimatePresence mode="wait">
          {currentQuiz && !loading && (
            <motion.div
              key={currentQuiz.question}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <QuizQuestionCard quiz={currentQuiz} onAnswered={handleAnswered} />

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={generateQuiz}
                  disabled={loading}
                  className="py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-black text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5 hover:shadow-xl transition-all"
                >
                  <Zap className="w-4 h-4" /> Soalan Seterusnya
                </button>
                <button
                  onClick={handleReset}
                  className="py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Tetapan Baru
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insufficient credits banner */}
        {insufficientCredits && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-amber-400/20 border-2 border-amber-300/50 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-amber-200 text-xs font-bold">⚠️ Kredit habis — sila top up untuk teruskan</p>
            <Link to="/buy-credits" className="px-3 py-1.5 rounded-xl bg-amber-300 text-amber-950 font-black text-xs hover:bg-amber-200 transition-all">
              Top Up Sekarang →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}