import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, GraduationCap, BookOpen, MessageCircle, Plus, Library } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import AIBackButton from '@/components/ai/AIBackButton';
import AIChatMessage from '@/components/ai/AIChatMessage';
import CreditBalanceWidget from '@/components/credits/CreditBalanceWidget';
import MyChatLibrary from '@/components/ai/MyChatLibrary';
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
  'Apa itu pendaraban?',
  'Bagaimana tumbuhan membesar?',
  'Kenapa langit berwarna biru?',
  'Beza kata nama dan kata kerja?',
];

export default function AIAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Assalamualaikum dan hai! Saya **Cikgu Firdaus** 👨‍🏫 Sedia membantu anak-anak belajar dengan cara yang mudah dan menyeronokkan. Tanya saya apa-apa soalan pelajaran — Matematik, Sains, BM, English atau Jawi. Mari kita belajar bersama! ✨' },
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('general');
  const [level, setLevel] = useState('darjah_3');
  const [loading, setLoading] = useState(false);
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'library'
  const [conversationId, setConversationId] = useState(null);
  const [libraryRefresh, setLibraryRefresh] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const persistConversation = async (allMessages, firstQuestion) => {
    // Auto-save / update conversation di background — tak block UI
    try {
      const userMsgs = allMessages.filter(m => m.role === 'user');
      const aiMsgs = allMessages.filter(m => m.role === 'ai');
      // skip kalau belum ada user message lagi (hanya greeting)
      if (userMsgs.length === 0) return;

      const title = (firstQuestion || userMsgs[0]?.content || 'Perbualan').slice(0, 80);

      // Auto-trim: simpan greeting + 80 messages terakhir kalau > 100 messages.
      // Cegah payload melebihi 200KB limit Base44 entity.
      let toSave = allMessages;
      if (allMessages.length > 100) {
        const greeting = allMessages[0]; // assume first is AI greeting
        toSave = [greeting, ...allMessages.slice(-80)];
      }

      const payload = {
        title,
        agent: 'cikgu_firdaus',
        subject,
        level,
        messages: toSave.map(m => ({ role: m.role, content: m.content, timestamp: new Date().toISOString() })),
        messageCount: allMessages.length,
        lastMessageAt: new Date().toISOString(),
      };

      if (conversationId) {
        await base44.entities.ChatConversation.update(conversationId, payload);
      } else {
        const created = await base44.entities.ChatConversation.create(payload);
        if (created?.id) setConversationId(created.id);
      }
      setLibraryRefresh(k => k + 1);
    } catch (err) {
      console.error('Persist conversation failed:', err);
    }
  };

  const handleAsk = async (overrideQuestion) => {
    const question = (overrideQuestion ?? input).trim();
    if (!question || loading) return;

    const afterUser = [...messages, { role: 'user', content: question }];
    setMessages(afterUser);
    setInput('');
    setLoading(true);
    setInsufficientCredits(false);

    try {
      const res = await base44.functions.invoke('askAIAssistant', {
        question,
        subject,
        level,
        childName: user?.full_name?.split(' ')[0] || '',
      });

      let finalMessages = afterUser;
      if (res.data?.error === 'INSUFFICIENT_CREDITS') {
        setInsufficientCredits(true);
        finalMessages = [...afterUser, {
          role: 'ai',
          content: `⚠️ **Kredit tidak mencukupi!**\n\nBaki anda: **${res.data.balance} kredit**\nDiperlukan: **${res.data.required} kredit**\n\nSila top up untuk terus bertanya.`,
        }];
        setMessages(finalMessages);
      } else if (res.data?.success) {
        finalMessages = [...afterUser, { role: 'ai', content: res.data.answer }];
        setMessages(finalMessages);
        // Notify CreditBalanceWidget supaya auto-refresh (event-based, no extra fetch)
        if (typeof res.data.newBalance === 'number') {
          window.dispatchEvent(new CustomEvent('credit-updated', {
            detail: { newBalance: res.data.newBalance, amountUsed: res.data.creditsUsed || 1 },
          }));
        }
      } else {
        throw new Error(res.data?.error || 'Ralat tidak diketahui');
      }

      // Persist (success or insufficient — masih log percubaan supaya tak hilang)
      persistConversation(finalMessages, question);
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

  const handleNewChat = () => {
    setMessages([
      { role: 'ai', content: 'Assalamualaikum dan hai! Saya **Cikgu Firdaus** 👨‍🏫 Sedia membantu anak-anak belajar dengan cara yang mudah dan menyeronokkan. Tanya saya apa-apa soalan pelajaran — Matematik, Sains, BM, English atau Jawi. Mari kita belajar bersama! ✨' },
    ]);
    setConversationId(null);
    setInsufficientCredits(false);
    setActiveTab('chat');
  };

  const handleResumeChat = (conv) => {
    setMessages(conv.messages || []);
    setConversationId(conv.id);
    if (conv.subject) setSubject(conv.subject);
    if (conv.level) setLevel(conv.level);
    setActiveTab('chat');
  };

  return (
    <div className="relative min-h-screen">
      <div className="md:hidden">
        <AppHeader showBack={true} backTo="/dashboard" title="Cikgu Firdaus" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 pt-4 pb-32">
        <div className="mb-4">
          <AIBackButton to="/dashboard" label="Kembali ke Dashboard" />
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/61dba1f3a_generated_image.png"
                alt="Cikgu Firdaus"
                className="w-14 h-14 rounded-2xl object-cover shadow-lg ring-2 ring-amber-300/60"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-purple-900" title="Online" />
            </div>
            <div>
              <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Tutor Peribadi Anak
              </p>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">Cikgu Firdaus 👨‍🏫</h1>
              <p className="text-slate-600 text-[10px] font-semibold">Sedia membantu · Pakar pelajaran sekolah</p>
            </div>
          </div>
          <CreditBalanceWidget compact />
        </motion.div>

        {/* Tab switcher + New chat */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-1.5 mb-3 grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'chat' ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MessageCircle className="w-4 h-4" /> Chat
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'library' ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Library className="w-4 h-4" /> Sejarah
          </button>
          <button
            onClick={handleNewChat}
            className="py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" /> Baharu
          </button>
        </div>

        {activeTab === 'library' ? (
          <MyChatLibrary refreshKey={libraryRefresh} onResume={handleResumeChat} />
        ) : (
        <>

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-3 mb-3 space-y-3">
          <div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1.5">Subjek</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {SUBJECTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSubject(s.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    subject === s.value ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1.5">Tahap</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    level === l.value ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
          className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-3xl p-4 mb-3 h-[55vh] overflow-y-auto space-y-3"
        >
          {messages.map((m, i) => <AIChatMessage key={i} role={m.role} content={m.content} />)}
          {loading && (
            <div className="flex items-center gap-2 text-slate-600 text-xs px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Cikgu Firdaus sedang berfikir...
            </div>
          )}
        </div>

        {/* Insufficient credits banner */}
        {insufficientCredits && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-amber-800 text-xs font-bold">⚠️ Kredit habis — sila top up untuk teruskan</p>
            <Link to="/buy-credits" className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black text-xs hover:bg-amber-600 transition-all">
              Top Up Sekarang →
            </Link>
          </motion.div>
        )}

        {/* Suggestions (kalau messages baru sahaja mula) */}
        {messages.length === 1 && (
          <div className="mb-3">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Cuba tanya
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(s)}
                  className="px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="Tanya saya apa-apa..."
            disabled={loading}
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-semibold px-3 py-2 focus:outline-none"
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
        <p className="text-center text-slate-500 text-[10px] mt-2 font-semibold">
          💰 {CREDIT_COSTS.ai_assistant} kredit setiap soalan
        </p>
        </>
        )}
      </div>
    </div>
  );
}