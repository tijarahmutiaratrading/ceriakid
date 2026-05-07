import React from 'react';

export default function MemoryCandyDecor() {
  return (
    <div className="hidden sm:block absolute right-4 top-40 w-36 md:w-44 pointer-events-none select-none">
      <div className="rounded-[2rem] bg-cream/90 bg-white/90 p-4 shadow-2xl rotate-2 border-4 border-white">
        <p className="text-purple-700 text-2xl md:text-3xl font-black leading-none text-center">MEMORY<br />GAME</p>
        <p className="mt-2 text-purple-700 text-[10px] md:text-xs font-black text-center tracking-wide">SWEET, CUTE<br />AND FUN</p>
      </div>
      <div className="mt-8 ml-6 relative w-28 h-32 md:w-36 md:h-40 rounded-[2rem] bg-sky-400 shadow-2xl rotate-12 border-4 border-sky-200">
        <div className="absolute -top-4 left-7 w-20 h-6 rounded-full bg-white rotate-12" />
        <div className="absolute inset-5 rounded-2xl bg-white/95 border-4 border-purple-400 flex items-center justify-center text-4xl">🍬</div>
        <div className="absolute -left-5 top-12 text-3xl -rotate-12">🍭</div>
        <div className="absolute -right-4 bottom-8 text-3xl rotate-12">🍬</div>
      </div>
    </div>
  );
}