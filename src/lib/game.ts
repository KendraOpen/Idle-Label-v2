// Idle Label Tycoon - Complete Game Logic v3

export type ResourceType = 'cash' | 'beats' | 'tracks' | 'fans' | 'xp';
export type SkillName = 'beatMaking' | 'production' | 'performance' | 'marketing' | 'business' | 'collaboration';

export interface Resources {
  cash: number;
  beats: number;
  tracks: number;
  fans: number;
  xp: number;
}

export interface GameState {
  resources: Resources;
  skills: Record<SkillName, number>;
  prestige: number;
  prestigeMultiplier: number;
  totalXp: number;
}

export interface Skill {
  name: string;
  icon: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  perLevel: number;
}

export const SKILLS: Record<SkillName, Skill> = {
  beatMaking: { name: "Beat Making", icon: "🎹", description: "Makes beats manually", baseCost: 10, costMultiplier: 1.5, perLevel: 1 },
  production: { name: "Production", icon: "🎛️", description: "5 Beats → 1 Track", baseCost: 50, costMultiplier: 1.6, perLevel: 1 },
  performance: { name: "Performance", icon: "🎤", description: "1 Track → 1 Fan", baseCost: 100, costMultiplier: 1.7, perLevel: 1 },
  marketing: { name: "Marketing", icon: "📢", description: "Earn cash from fans", baseCost: 200, costMultiplier: 1.8, perLevel: 0.1 },
  business: { name: "Business", icon: "💼", description: "Auto-generates beats", baseCost: 500, costMultiplier: 2.0, perLevel: 2 },
  collaboration: { name: "Collaboration", icon: "🤝", description: "XP bonus", baseCost: 1000, costMultiplier: 1.9, perLevel: 0.15 },
};

export const MAX_LEVEL = 100;
export const PRESTIGE_MULTIPLIER = 1.1;
export const PRESTIGE_XP = 1000;

export function createDefaultState(): GameState {
  return {
    resources: { cash: 50, beats: 0, tracks: 0, fans: 0, xp: 0 },
    skills: { beatMaking: 0, production: 0, performance: 0, marketing: 0, business: 0, collaboration: 0 },
    prestige: 0,
    prestigeMultiplier: 1,
    totalXp: 0,
  };
}

export function getUpgradeCost(skill: SkillName, level: number): number {
  return Math.floor(SKILLS[skill].baseCost * Math.pow(SKILLS[skill].costMultiplier, level));
}

// Full game tick - runs every second
export function gameTick(state: GameState): GameState {
  const mult = state.prestigeMultiplier;
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  
  // 1. Beat Making: generates beats per second
  const beatMakingOutput = newState.skills.beatMaking * SKILLS.beatMaking.perLevel * mult;
  newState.resources.beats += beatMakingOutput;
  
  // 2. Business: generates more beats per second
  const businessOutput = newState.skills.business * SKILLS.business.perLevel * mult;
  newState.resources.beats += businessOutput;
  
  // 3. Production: converts 5 beats → 1 track
  const production = newState.skills.production;
  if (production > 0 && newState.resources.beats >= 5) {
    const beatsToUse = Math.min(newState.resources.beats, 5 * production * mult);
    const tracksMade = Math.floor(beatsToUse / 5);
    newState.resources.beats -= beatsToUse;
    newState.resources.tracks += tracksMade;
  }
  
  // 4. Performance: converts 1 track → 1 fan
  const perf = newState.skills.performance;
  if (perf > 0 && newState.resources.tracks >= 1) {
    const fansMade = Math.min(newState.resources.tracks, perf * mult);
    newState.resources.tracks -= fansMade;
    newState.resources.fans += fansMade;
  }
  
  // 5. Marketing: generates cash from fans (10% per level)
  const marketing = newState.skills.marketing;
  if (marketing > 0 && newState.resources.fans > 0) {
    const cashPerFan = 0.1 * (1 + marketing * 0.1);
    const cashMade = Math.floor(newState.resources.fans * cashPerFan * mult);
    newState.resources.cash += Math.max(1, cashMade);
  }
  
  // 6. XP from activity (1 XP per 10 beats generated)
  const collab = newState.skills.collaboration;
  const xpMult = 1 + collab * SKILLS.collaboration.perLevel;
  const xpGained = Math.floor((beatMakingOutput + businessOutput) * 0.1 * xpMult);
  newState.resources.xp += xpGained;
  newState.totalXp += xpGained;
  
  return newState;
}

export function upgradeSkill(state: GameState, skill: SkillName): GameState | null {
  const level = state.skills[skill];
  if (level >= MAX_LEVEL) return null;
  
  const cost = getUpgradeCost(skill, level);
  if (state.resources.cash < cost) return null;
  
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  newState.resources.cash -= cost;
  newState.skills[skill]++;
  return newState;
}

export function getPrestigeInfo(state: GameState) {
  const cost = Math.floor(PRESTIGE_XP * Math.pow(1.5, state.prestige));
  return {
    canPrestige: state.resources.xp >= cost,
    cost,
    bonus: PRESTIGE_MULTIPLIER,
  };
}

export function doPrestige(state: GameState): GameState | null {
  const info = getPrestigeInfo(state);
  if (!info.canPrestige) return null;
  
  const newState = createDefaultState();
  newState.prestige = state.prestige + 1;
  newState.prestigeMultiplier = 1 + newState.prestige * 0.1;
  return newState;
}

// Storage
const KEY = 'idleLabel_v3';

export function saveGame(state: GameState): void {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadGame(): GameState | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEY);
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

export function clearSave(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY);
}