'use client';

import { useGame } from '@/lib/useGame';

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return Math.floor(num).toString();
}

export default function Home() {
  const {
    clickToEarn,
    state,
    isLoading,
    upgrade,
    prestige,
    save,
    reset,
    calculatePrestige,
    calculateUpgradeCost,
    SKILLS,
    MAX_LEVEL,
  } = useGame();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-[#2dd4bf] text-2xl">Loading...</div>
      </div>
    );
  }

  // If no state, show error
  if (!state) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-red-500">Error loading game</div>
      </div>
    );
  }

  const prestigeInfo = calculatePrestige;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-wider mb-2">
            <span className="bg-gradient-to-r from-[#2dd4bf] via-[#6366f1] to-[#FF6B6B] bg-clip-text text-transparent">
              IDLE LABEL
            </span>
          </h1>
          <p className="text-[#94a3b8]">Build your music empire</p>
          
          {state.prestige > 0 && (
            <div className="mt-2 inline-block bg-[#6366f1] px-4 py-1 rounded-full text-sm">
              🌟 Prestige: {state.prestige} ({(state.prestigeMultiplier).toFixed(1)}x)
            </div>
          )}
        </header>

        {/* Manual Click Button */}
        <div className="mb-6 text-center">
          <button 
            onClick={() => clickToEarn()}
            className="px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-orange-500 rounded-xl font-bold text-lg animate-pulse hover:scale-105 transition-transform"
          >
            🎵 Click to Make Beat (+1 Beat)
          </button>
        </div>
        {/* CLICK TO EARN - Starter mechanic */}
        <div className="mb-6 text-center">
          <button 
            onClick={clickToEarn}
            className="px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-orange-500 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-[#FF6B6B]/20"
          >
            🎵 Click to Make Beat (+1)
          </button>
        </div>
        {/* Resources - Force update every render */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { key: 'cash', icon: '💵', label: 'Cash', value: state.resources.cash, color: 'from-green-500 to-emerald-600' },
            { key: 'beats', icon: '🎵', label: 'Beats', value: state.resources.beats, color: 'from-cyan-500 to-blue-600' },
            { key: 'tracks', icon: '🎬', label: 'Tracks', value: state.resources.tracks, color: 'from-purple-500 to-pink-600' },
            { key: 'fans', icon: '👥', label: 'Fans', value: state.resources.fans, color: 'from-orange-500 to-red-600' },
            { key: 'xp', icon: '⭐', label: 'XP', value: state.resources.xp, color: 'from-yellow-500 to-amber-600' },
          ].map((res) => (
            <div
              key={res.key}
              className="bg-[#111827] rounded-xl p-4 border border-[#1e293b]"
            >
              <div className="text-2xl mb-1">{res.icon}</div>
              <div className="text-xs text-[#64748b] uppercase">{res.label}</div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {formatNumber(res.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(SKILLS).map(([key, skill]) => {
            const level = state.skills[key];
            const cost = calculateUpgradeCost(key, level);
            const isMaxed = level >= MAX_LEVEL;
            const canAfford = state.resources.cash >= cost;

            return (
              <div
                key={key}
                className="bg-[#111827] rounded-xl p-4 border border-[#1e293b] hover:border-[#2dd4bf] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{skill.icon}</span>
                    <span className="font-semibold">{skill.name}</span>
                  </div>
                  <span className="text-[#64748b] text-sm">Lvl {level}</span>
                </div>
                
                <p className="text-xs text-[#64748b] mb-3">{skill.description}</p>
                
                <div className="h-2 bg-[#0a0e17] rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2dd4bf] to-[#6366f1]"
                    style={{ width: `${(level / MAX_LEVEL) * 100}%` }}
                  />
                </div>
                
                <button
                  onClick={() => upgrade(key)}
                  disabled={isMaxed || !canAfford}
                  className={`w-full py-2 rounded-lg font-medium ${
                    isMaxed
                      ? 'bg-[#1e293b] text-[#64748b]'
                      : canAfford
                      ? 'bg-gradient-to-r from-[#2dd4bf] to-[#6366f1] text-white'
                      : 'bg-[#1e293b] text-[#64748b]'
                  }`}
                >
                  {isMaxed ? 'MAXED' : `Upgrade 💵 ${formatNumber(cost)}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Prestige */}
        <div className="bg-[#111827] rounded-xl p-6 border border-[#6366f1] mb-8 text-center">
          <h2 className="text-xl font-bold mb-2">🌟 Prestige</h2>
          <p className="text-[#94a3b8] text-sm mb-4">
            Reset for permanent multiplier
          </p>
          {prestigeInfo && (
            <button
              onClick={prestige}
              disabled={!prestigeInfo.canPrestige}
              className={`px-6 py-2 rounded-lg font-medium ${
                prestigeInfo.canPrestige
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#1e293b] text-[#64748b]'
              }`}
            >
              {prestigeInfo.canPrestige
                ? `Prestige (+${prestigeInfo.bonus}x)`
                : `Need ${formatNumber(prestigeInfo.cost)} XP`}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button onClick={save} className="px-4 py-2 bg-[#1e293b] rounded-lg">
            💾 Save
          </button>
          <button 
            onClick={() => { if (confirm('Reset?')) reset(); }} 
            className="px-4 py-2 bg-[#1e293b] rounded-lg"
          >
            🗑️ Reset
          </button>
        </div>

        <footer className="text-center mt-8 text-[#64748b] text-sm">
          <p>💡 Beats → Tracks → Fans → Cash!</p>
        </footer>
      </div>
    </div>
  );
}