import React from 'react';

export default function MasterGeneratorTabs({ tab, setTab, miniGamesTab, setMiniGamesTab, storyKidTab, setStoryKidTab }) {
  const groups = [
    {
      id: 'games',
      label: 'Games',
      emoji: '🎮',
      active: ['generator', 'manager', 'monthly'].includes(tab),
      onClick: () => setTab('generator'),
      actions: [
        { id: 'generator', label: 'Generate', active: tab === 'generator', onClick: () => setTab('generator') },
        { id: 'manager', label: 'Manage', active: tab === 'manager', onClick: () => setTab('manager') },
        { id: 'monthly', label: 'Monthly', active: tab === 'monthly', onClick: () => setTab('monthly') },
      ],
    },
    {
      id: 'minigames',
      label: 'Mini Games',
      emoji: '🧩',
      active: tab === 'minigames',
      onClick: () => setTab('minigames'),
      actions: [
        { id: 'mini-generate', label: 'Generate', active: miniGamesTab === 'generate', onClick: () => setMiniGamesTab('generate') },
        { id: 'mini-manage', label: 'Manage', active: miniGamesTab === 'manage', onClick: () => setMiniGamesTab('manage') },
      ],
    },
    {
      id: 'storykid',
      label: 'Story Kid',
      emoji: '📖',
      active: tab === 'storykid',
      onClick: () => setTab('storykid'),
      actions: [
        { id: 'story-generate', label: 'Generate', active: storyKidTab === 'generate', onClick: () => setStoryKidTab('generate') },
        { id: 'story-manage', label: 'Manage', active: storyKidTab === 'manage', onClick: () => setStoryKidTab('manage') },
      ],
    },
  ];

  return (
    <div className="sticky top-20 z-30 w-full min-w-0 max-w-full overflow-hidden rounded-[1.35rem] border border-white/20 bg-white/10 p-1.5 shadow-2xl shadow-purple-950/25 backdrop-blur-3xl md:top-24 md:rounded-[2rem] md:p-2">
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:gap-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`relative min-w-0 overflow-hidden rounded-[1.1rem] transition-all duration-200 md:rounded-[1.35rem] ${group.active ? 'bg-white text-indigo-900 shadow-xl shadow-black/15' : 'text-white/70 hover:bg-white/12 hover:text-white'}`}
          >
            {group.active && <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50" />}
            <button
              type="button"
              onClick={group.onClick}
              className="relative z-10 flex w-full items-center gap-2 px-3 py-2.5 text-left md:px-4 md:py-3"
            >
              <span className="text-lg">{group.emoji}</span>
              <span className="font-black leading-tight md:text-base">{group.label}</span>
            </button>

            {group.active && (
              <div className="relative z-10 flex flex-wrap gap-1.5 px-2.5 pb-2.5 md:px-3 md:pb-3">
                {group.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black transition-all ${action.active ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-100 text-indigo-500 hover:bg-indigo-200'}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {group.active && <span className="absolute bottom-0 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300" />}
          </div>
        ))}
      </div>
    </div>
  );
}