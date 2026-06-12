import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import StoryAudioPlayer from '@/components/story/StoryAudioPlayer';

// Pembaca untuk cerita yang dijana melalui Story Generator (entity AIStory).
// Format linear: cover + teks penuh markdown + moral.
export default function AIStoryReader({ story, onBack, onComplete }) {
  const [done, setDone] = React.useState(false);

  const finish = () => {
    setDone(true);
    onComplete?.();
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative bg-slate-950">
      {/* Latar cover blur */}
      {story.coverImage && (
        <div className="fixed inset-0 pointer-events-none">
          <img src={story.coverImage} alt="" className="h-full w-full object-cover scale-110 blur-2xl opacity-25" />
        </div>
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28">
        {/* Top bar */}
        <div className="flex items-center gap-2 sm:gap-3 mb-5">
          <button onClick={onBack} className="w-11 h-11 rounded-2xl bg-white/95 text-purple-700 font-black shadow-lg flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-3 py-2">
            <h1 className="text-white font-black text-sm sm:text-base truncate drop-shadow">{story.title}</h1>
          </div>
          <div className="h-11 flex items-center"><StoryAudioPlayer autoPlay /></div>
        </div>

        {/* Cover */}
        {story.coverImage && (
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            src={story.coverImage}
            alt={story.title}
            className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl ring-1 ring-white/15 mb-5"
          />
        )}

        {/* Story text — gaya buku */}
        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl px-5 py-6 sm:px-7 sm:py-8 mb-5"
          style={{ background: 'linear-gradient(180deg, #FFF8E7 0%, #FCEBC8 100%)', border: '2px solid #C8956A', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}
        >
          <div className="text-amber-950 text-base sm:text-lg leading-relaxed prose prose-amber max-w-none [&_p]:mb-4 [&_strong]:text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
            <ReactMarkdown>{story.story}</ReactMarkdown>
          </div>
        </motion.div>

        {/* Moral */}
        {story.moralSummary && (
          <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-5 mb-6 text-center">
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.18em] mb-2">Moral Cerita</p>
            <p className="text-white text-base font-bold leading-relaxed">{story.moralSummary}</p>
          </div>
        )}

        {/* Tamat */}
        {done ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button onClick={() => setDone(false)} className="py-3.5 rounded-2xl bg-white/15 text-white font-bold text-sm hover:bg-white/25 transition-all flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Baca Semula
            </button>
            <button onClick={onBack} className="py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-white/90 transition-all">
              Cerita Lain
            </button>
          </div>
        ) : (
          <button onClick={finish} className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-black text-base shadow-xl flex items-center justify-center gap-2">
            <Star className="w-5 h-5 fill-white" /> Tamat Baca
          </button>
        )}
      </div>
    </div>
  );
}