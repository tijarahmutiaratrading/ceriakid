import React from 'react';

export default function MasterGeneratorTabs({ tab, setTab, miniGamesTab, setMiniGamesTab, storyKidTab, setStoryKidTab }) {
  const tabs = [
    { id: 'generator', label: 'Generate', short: 'Generate', emoji: '🎮', section: 'Games', onClick: () => setTab('generator'), active: tab === 'generator' },
    { id: 'manager', label: 'Manage', short: 'Manage', emoji: '📋', section: 'Games', onClick: () => setTab('manager'), active: tab === 'manager' },
    { id: 'monthly', label: 'Monthly', short: 'Monthly', emoji: '📅', section: 'Games', onClick: () => setTab('monthly'), active: tab === 'monthly' },
    { id: 'mini-generate', label: 'Generate', short: 'Mini Gen', emoji: '🎯', section: 'Mini Games', onClick: () => { setTab('minigames'); setMiniGamesTab('generate'); }, active: tab === 'minigames' && miniGamesTab === 'generate' },
    { id: 'mini-manage', label: 'Manage', short: 'Mini Mgmt', emoji: '🧩', section: 'Mini Games', onClick: () => { setTab('minigames'); setMiniGamesTab('manage'); }, active: tab === 'minigames' && miniGamesTab === 'manage' },
    { id: 'story-generate', label: 'Generate', short: 'Story Gen', emoji: '📖', section: 'Story Kid', onClick: () => { setTab('storykid'); setStoryKidTab('generate'); }, active: tab === 'storykid' && storyKidTab === 'generate' },
    { id: 'story-manage', label: 'Manage', short: 'Story Mgmt', emoji: '📝', section: 'Story Kid', onClick: () => { setTab('storykid'); setStoryKidTab('manage'); }, active: tab === 'storykid' && storyKidTab === 'manage' },
  ];

  return (
    <div className="sticky top-20 z-30 w-full min-w-0 max-w-full overflow-hidden rounded-[1.35rem] border border-white/20 bg-white/10 p-1.5 shadow-2xl shadow-purple-950/25 backdrop-blur-3xl md:top-24 md:rounded-[2rem] md:p-2">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-7 lg:gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={`group relative flex min-w-0 flex-col items-start overflow-hidden rounded-[1.1rem] px-3 py-2.5 text-left transition-all duration-200 md:rounded-[1.35rem] md:px-4 md:py-3 ${item.active ? 'bg-white text-indigo-900 shadow-xl shadow-black/15' : 'text-white/70 hover:bg-white/12 hover:text-white'}`}
          >
            {item.active && <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50" />}
            <span className="relative z-10 text-[9px] font-black uppercase tracking-wider opacity-60 md:text-[10px]">{item.section}</span>
            <span className="relative z-10 mt-1 flex items-center gap-1.5 text-[11px] font-black leading-tight md:gap-2 md:text-sm">
              <span>{item.emoji}</span>
              <span className="md:hidden">{item.short}</span>
              <span className="hidden md:inline">{item.label}</span>
            </span>
            {item.active && <span className="absolute bottom-0 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300" />}
          </button>
        ))}
      </div>
    </div>
  );
}