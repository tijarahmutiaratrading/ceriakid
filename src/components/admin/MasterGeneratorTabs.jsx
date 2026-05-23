import React from 'react';

export default function MasterGeneratorTabs({ tab, setTab, storyKidTab, setStoryKidTab }) {
  const tabs = [
    { id: 'generator', label: 'Generate', short: 'Generate', emoji: '🎮', section: 'Games', onClick: () => setTab('generator'), active: tab === 'generator' },
    { id: 'manager', label: 'Manage', short: 'Manage', emoji: '📋', section: 'Games', onClick: () => setTab('manager'), active: tab === 'manager' },
    { id: 'monthly', label: 'Monthly', short: 'Monthly', emoji: '📅', section: 'Games', onClick: () => setTab('monthly'), active: tab === 'monthly' },
    { id: 'mini-info', label: 'Info', short: 'Mini Info', emoji: '🧩', section: 'Mini Games', onClick: () => setTab('minigames'), active: tab === 'minigames' },
    { id: 'story-generate', label: 'Generate', short: 'Story Gen', emoji: '📖', section: 'Story Kid', onClick: () => { setTab('storykid'); setStoryKidTab('generate'); }, active: tab === 'storykid' && storyKidTab === 'generate' },
    { id: 'story-manage', label: 'Manage', short: 'Story Mgmt', emoji: '📝', section: 'Story Kid', onClick: () => { setTab('storykid'); setStoryKidTab('manage'); }, active: tab === 'storykid' && storyKidTab === 'manage' },
  ];

  return (
    <div className="sticky top-20 z-30 w-full min-w-0 max-w-full rounded-[1.35rem] border border-white/20 bg-white/10 p-1.5 shadow-2xl shadow-purple-950/25 backdrop-blur-3xl md:top-24 md:rounded-[2rem] md:p-2">
      {/* Horizontal scrollable rail on small/medium viewports, full grid on xl+ */}
      <div className="flex gap-1.5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 xl:grid xl:grid-cols-6 xl:gap-2 xl:overflow-visible xl:pb-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={`group relative flex shrink-0 snap-start flex-col items-start overflow-hidden rounded-[1.1rem] px-3 py-2.5 text-left transition-all duration-200 xl:shrink xl:w-auto md:rounded-[1.35rem] md:px-4 md:py-3 ${item.active ? 'bg-white text-indigo-900 shadow-xl shadow-black/15' : 'text-white/70 hover:bg-white/12 hover:text-white'}`}
            style={{ minWidth: '6.25rem' }}
          >
            {item.active && <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50" />}
            <span className="relative z-10 text-[9px] font-black uppercase tracking-wider opacity-60 md:text-[10px]">{item.section}</span>
            <span className="relative z-10 mt-1 flex items-center gap-1.5 text-[11px] font-black leading-tight md:gap-2 md:text-sm">
              <span>{item.emoji}</span>
              <span className="xl:hidden">{item.short}</span>
              <span className="hidden xl:inline">{item.label}</span>
            </span>
            {item.active && <span className="absolute bottom-0 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300" />}
          </button>
        ))}
      </div>
    </div>
  );
}