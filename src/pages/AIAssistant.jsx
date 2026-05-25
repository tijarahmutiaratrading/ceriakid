import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, GraduationCap, BookOpen } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import AIBackButton from '@/components/ai/AIBackButton';
import AIChatMessage from '@/components/ai/AIChatMessage';
import CreditBalanceWidget from '@/components/credits/CreditBalanceWidget';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { CREDIT_COSTS } from '@/lib/creditPackages';

const SUBJECTS = [
  { value: 'general', label: 'Umum', emoji: '💡' },
  { value: 'bahasa_melayu', label: 'BM', emoji: '🇲🇾' },
  { value: 'english', label: 'English', emoji: '🇬🇧' },
  { value: 'mathematics', label: 'Matematik', emoji: '🔢' },
  { value: 'science', label: 'Sains', emoji: '🔬' },
  { value: 'jawi', label: 'Jawi', emoji: '✍️' },
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

const SUGGESTIONS = [
  { text: '🎯 Bagi saya 5 soalan kuiz', isQuiz: true },
  { text: '📚 Kuiz saya tentang topik ini', isQuiz: true },
  { text: '✏️ Latih saya dengan soalan', isQuiz: true },
  { text: 'Apa itu pendaraban?', isQuiz: false },
  { text: 'Bagaimana tumbuhan membesar?', isQuiz: false },
  { text: 'Kenapa langit berwarna biru?', isQuiz: false },
];

export default function AIAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hai! Saya Cikgu AI 🎓 Tanya saya apa-apa soalan, atau minta saya **jana soalan kuiz** untuk latih kamu! ✨\n\nContoh: _"Bagi saya 5 soalan matematik"_ atau _"Kuiz saya tentang haiwan"_' },
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('general');
  const [level, setLevel] = useState('darjah_3');
  const [loading, setLoading] = useState(false);
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async (overrideQuestion) => {
    const question = (overrideQuestion ?? input).trim();
    if (!question || loading) return;

    const updatedMessages = [...messages, { role: 'user', content: question }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setInsufficientCredits(false);

    // Last 6 messages for context (exclude system intro)
    const history = updatedMessages.slice(1).slice(-6).map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : '',
    }));

    try {
      const res = await base44.functions.invoke('askAIAssistant', {
        question,
        subject,
        level,
        childName: user?.full_name?.split(' ')[0] || '',
        history,
      });

      if (res.data?.error === 'INSUFFICIENT_CREDITS') {
        setInsufficientCredits(true);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: `⚠️ **Kredit tidak mencukupi!**\n\nBaki anda: **${res.data.balance} kredit**\nDiperlukan: **${res.data.required} kredit**\n\nSila top up untuk terus bertanya.`,
        }]);
      } else if (res.data?.success) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: res.data.answer,
          quiz: res.data.quiz || null,
        }]);
      } else {
        throw new Error(res.data?.error || 'Ralat tidak diketahui');
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e.message;
      if (msg?.includes('INSUFFICIENT')) {
        setInsufficientCredits(true);
      }
      toast({ title: 'Ralat', description: msg, variant: 'destructive' });
      setMessages(prev => [...prev, { role: 'ai', content: `❌ Maaf, berlaku ralat. Sila cuba lagi.` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswered = (result) => {
    // Append student's answer as a user message (no credit charge — just local echo)
    const feedbackMsg = result.isCorrect
      ? `✅ Saya pilih: "${result.selectedText}" — Betul!`
      : `❌ Saya pilih: "${result.selectedText}" — Jawapan betul: "${result.correctText}"`;
    setMessages(prev => [...prev, { role: 'user', content: feedbackMsg }]);
    // Auto-trigger Cikgu AI follow-up (charges 1 credit — natural conversation)
    setTimeout(() => {
      handleAsk(result.isCorrect
        ? 'Saya jawab betul! Bagi soalan lagi yang lebih mencabar.'
        : 'Saya jawab salah. Boleh terangkan, kemudian bagi soalan serupa untuk saya cuba lagi?');
    }, 600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 35%, #4a1d6e 70%, #6b1d52 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-game-purple/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] bg-game-pink/35 rounded-full blur-3xl" />
      </div>

      <div className="md:hidden">
        <AppHeader showBack={true} backTo="/dashboard" title="Cikgu AI" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 pt-24 md:pt-6 pb-32">
        <div className="mb-4">
          <AIBackButton to="/dashboard" label="Kembali ke Dashboard" />
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Pembantu AI
              </p>
              <h1 className="text-xl md:text-2xl font-black text-white">Cikgu AI</h1>
            </div>
          </div>
          <CreditBalanceWidget compact />
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pro-glass rounded-2xl p-3 mb-3 space-y-3">
          <div>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1.5">Subjek</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {SUBJECTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSubject(s.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    subject === s.value ? 'bg-white text-game-purple shadow' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1.5">Tahap</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    level === l.value ? 'bg-white text-game-purple shadow' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chat */}
        <div
          ref={scrollRef}
          className="pro-glass rounded-3xl p-4 mb-3 h-[55vh] overflow-y-auto space-y-3"
        >
          {messages.map((m, i) => (
            <AIChatMessage
              key={i}
              role={m.role}
              content={m.content}
              quiz={m.quiz}
              onQuizAnswered={handleQuizAnswered}
            />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-white/80 text-xs px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Cikgu AI sedang berfikir...
            </div>
          )}
        </div>

        {/* Insufficient credits banner */}
        {insufficientCredits && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 bg-amber-400/20 border-2 border-amber-300/50 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-amber-200 text-xs font-bold">⚠️ Kredit habis — sila top up untuk teruskan</p>
            <Link to="/buy-credits" className="px-3 py-1.5 rounded-xl bg-amber-300 text-amber-950 font-black text-xs hover:bg-amber-200 transition-all">
              Top Up Sekarang →
            </Link>
          </motion.div>
        )}

        {/* Suggestions (kalau messages baru sahaja mula) */}
        {messages.length === 1 && (
          <div className="mb-3">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Cuba tanya
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(s.text)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    s.isQuiz
                      ? 'bg-gradient-to-r from-amber-400/30 to-orange-500/30 hover:from-amber-400/50 hover:to-orange-500/50 text-amber-100 border border-amber-300/40'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="pro-glass rounded-2xl p-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="Tanya saya apa-apa..."
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder-white/40 text-sm font-semibold px-3 py-2 focus:outline-none"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm shadow-lg disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Hantar</span>
          </button>
        </div>
        <p className="text-center text-white/50 text-[10px] mt-2 font-semibold">
          💰 {CREDIT_COSTS.ai_assistant} kredit setiap soalan
        </p>
      </div>
    </div>
  );
}