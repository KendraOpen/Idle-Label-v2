'use client';

import { useGame } from '@/lib/useGame'; import type { SkillName } from '@/lib/game';

function fmt(n: number): string {
  if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return Math.floor(n).toString();
}

export default function Home() {
  const { state, isLoading, upgrade, clickToEarn, prestige, save, reset, prestigeInfo, getCost, SKILLS, MAX_LEVEL } = useGame();

  if (isLoading) return <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center text-[#2dd4bf]">Loading...</div>;
  if (!state) return <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center text-red-500">Error</div>;

  const resources = [
    { k: 'cash', i: '💵', l: 'Cash', v: state.resources.cash },
    { k: 'beats', i: '🎵', l: 'Beats', v: state.resources.beats },
    { k: 'tracks', i: '🎬', l: 'Tracks', v: state.resources.tracks },
    { k: 'fans', i: '👥', l: 'Fans', v: state.resources.fans },
    { k: 'xp', i: '⭐', l: 'XP', v: state.resources.xp },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-2">
            <span className="bg-gradient-to-r from-[#2dd4bf] via-[#6366f1] to-[#FF6B6B] bg-clip-text text-transparent">IDLE LABEL</span>
          </h1>
          <p className="text-[#94a3b8]">Build your music empire!</p>
          {state.prestige > 0 && <div className="mt-2 inline-block bg-[#6366f1] px-4 py-1 rounded-full text-sm">🌟 {state.prestige} ({state.prestigeMultiplier.toFixed(1)}x)</div>}
        </header>

        {/* CLICK TO EARN */}
        <div className="mb-6 text-center">
          <button onClick={clickToEarn} className="px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-orange-500 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg">
            🎵 Click to Make Beat (+1)
          </button>
        </div>

        {/* RESOURCES */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {resources.map(r => (
            <div key={r.k} className="bg-[#111827] rounded-xl p-4 border border-[#1e293b]">
              <div className="text-2xl mb-1">{r.i}</div>
              <div className="text-xs text-[#64748b] uppercase">{r.l}</div>
              <div className="text-xl md:text-2xl font-bold">{fmt(r.v)}</div>
            </div>
          ))}
        </div>

        {/* HOW TO PLAY */}
        <div className="bg-[#111827] rounded-xl p-4 border border-[#2dd4bf] mb-6 text-center text-sm text-[#94a3b8]">
          <p>🎵 Click to get Beats → 🎹 Beat Making makes Beats/s → 🎛️ Production makes Tracks → 🎤 Performance makes Fans → 💵 Marketing gives Cash!</p>
        </div>

        {/* SKILLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {(Object.keys(SKILLS) as SkillName[]).map(skillKey => {
            const skill = SKILLS[skillKey];
            const level = state.skills[skillKey];
            const cost = getCost(skillKey);
            const maxed = level >= MAX_LEVEL;
            const canAfford = state.resources.cash >= cost;

            return (
              <div key={skillKey} className="bg-[#111827] rounded-xl p-4 border border-[#1e293b] hover:border-[#2dd4bf] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{skill.icon}</span>
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-[#64748b] text-sm">Lvl {level}</span>
                </div>
                <p className="text-xs text-[#64748b] mb-2">{skill.description}</p>
                <div className="h-2 bg-[#0a0e17] rounded-full mb-3">
                  <div className="h-full bg-gradient-to-r from-[#2dd4bf] to-[#6366f1]" style={{width: `${(level/MAX_LEVEL)*100}%`}} />
                </div>
                <button onClick={() => upgrade(skillKey)} disabled={maxed || !canAfford} className={`w-full py-2 rounded-lg font-medium ${maxed ? 'bg-[#1e293b] text-[#64748b]' : canAfford ? 'bg-gradient-to-r from-[#2dd4bf] to-[#6366f1] text-white' : 'bg-[#1e293b] text-[#64748b]'}`}>
                  {maxed ? 'MAXED' : `Upgrade 💵${fmt(cost)}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* PRESTIGE */}
        <div className="bg-[#111827] rounded-xl p-6 border border-[#6366f1] mb-8 text-center">
          <h2 className="text-xl font-bold mb-2">🌟 Prestige</h2>
          <p className="text-[#94a3b8] text-sm mb-4">Reset for permanent multiplier!</p>
          <button onClick={prestige} disabled={!prestigeInfo.canPrestige} className={`px-6 py-2 rounded-lg font-medium ${prestigeInfo.canPrestige ? 'bg-[#6366f1] text-white' : 'bg-[#1e293b] text-[#64748b]'}`}>
            {prestigeInfo.canPrestige ? `Prestige (+${prestigeInfo.bonus}x)` : `Need ${fmt(prestigeInfo.cost)} XP`}
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 justify-center mb-6">
          <button onClick={save} className="px-4 py-2 bg-[#1e293b] rounded-lg hover:bg-[#2dd4bf] hover:text-white">💾 Save</button>
          <button onClick={() => confirm('Reset?') && reset()} className="px-4 py-2 bg-[#1e293b] rounded-lg hover:bg-red-600 hover:text-white">🗑️ Reset</button>
        </div>
      </div>
    </div>
  );
}