// Idle Label Tycoon - Game Logic

export type ResourceType = 'cash' | 'beats' | 'tracks' | 'fans' | 'xp';

export interface Resources {
  cash: number;
  beats: number;
  tracks: number;
  fans: number;
  xp: number;
}

export type SkillName = 'beatMaking' | 'production' | 'performance' | 'marketing' | 'business' | 'collaboration';

export interface Skill {
  name: string;
  icon: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  baseOutput: number;
  basePerLevel: number;
  inputResource?: ResourceType;
  inputCost?: number;
  outputResource?: ResourceType;
}

export interface Skills {
  [key: string]: Skill;
}

export interface GameState {
  resources: Resources;
  skills: { [key: string]: number };
  prestige: number;
  prestigeMultiplier: number;
  totalXp: number;
}

export const SKILLS: Skills = {
  beatMaking: {
    name: "Beat Making",
    icon: "🎹",
    description: "Generates Beats automatically",
    baseCost: 10,
    costMultiplier: 1.5,
    baseOutput: 1,
    basePerLevel: 1,
  },
  production: {
    name: "Production",
    icon: "🎛️",
    description: "Converts Beats to Tracks",
    baseCost: 50,
    costMultiplier: 1.6,
    baseOutput: 1,
    basePerLevel: 1,
    inputResource: "beats",
    inputCost: 5,
    outputResource: "tracks",
  },
  performance: {
    name: "Performance",
    icon: "🎤",
    description: "Converts Tracks to Fans",
    baseCost: 100,
    costMultiplier: 1.7,
    baseOutput: 1,
    basePerLevel: 1,
    inputResource: "tracks",
    inputCost: 1,
    outputResource: "fans",
  },
  marketing: {
    name: "Marketing",
    icon: "📢",
    description: "Cash multiplier from Fans",
    baseCost: 200,
    costMultiplier: 1.8,
    baseOutput: 0,
    basePerLevel: 0.1, // 10% bonus per level
  },
  business: {
    name: "Business",
    icon: "💼",
    description: "Auto-generates Beats",
    baseCost: 500,
    costMultiplier: 2.0,
    baseOutput: 0,
    basePerLevel: 2,
  },
  collaboration: {
    name: "Collaboration",
    icon: "🤝",
    description: "XP multiplier",
    baseCost: 1000,
    costMultiplier: 1.9,
    baseOutput: 0,
    basePerLevel: 0.15, // 15% XP bonus per level
  },
};

export const MAX_LEVEL = 100;
export const PRESTIGE_MULTIPLIER = 1.1;
export const PRESTIGE_REQUIRED_XP = 1000;

export function createDefaultState(): GameState {
  return {
    resources: {
      cash: 0,
      beats: 0,
      tracks: 0,
      fans: 0,
      xp: 0,
    },
    skills: {
      beatMaking: 0,
      production: 0,
      performance: 0,
      marketing: 0,
      business: 0,
      collaboration: 0,
    },
    prestige: 0,
    prestigeMultiplier: 1,
    totalXp: 0,
  };
}

export function calculateUpgradeCost(skillName: string, level: number): number {
  const skill = SKILLS[skillName];
  return Math.floor(skill.baseCost * Math.pow(skill.costMultiplier, level));
}

export function calculateProduction(skillName: string, level: number, multiplier: number): number {
  const skill = SKILLS[skillName];
  return skill.baseOutput * (1 + level * 0.1) * multiplier;
}

export function calculatePassiveGeneration(skillName: string, level: number, multiplier: number): number {
  const skill = SKILLS[skillName];
  return level * skill.basePerLevel * multiplier;
}

export function getPrestigeMultiplier(prestige: number): number {
  return 1 + prestige * 0.1;
}

export function canAfford(state: GameState, cost: number): boolean {
  return state.resources.cash >= cost;
}

export function processTick(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const mult = newState.prestigeMultiplier;

  // Generate passive beats from Beat Making
  const beatOutput = calculatePassiveGeneration('beatMaking', newState.skills.beatMaking, mult);
  newState.resources.beats += beatOutput;

  // Generate passive beats from Business
  const businessOutput = calculatePassiveGeneration('business', newState.skills.business, mult);
  newState.resources.beats += businessOutput;

  // Production: convert beats to tracks
  const productionLevel = newState.skills.production;
  if (productionLevel > 0 && newState.resources.beats >= 5) {
    const productionCapacity = productionLevel * calculateProduction('production', productionLevel, mult);
    const beatsToUse = Math.min(newState.resources.beats, 5 * productionCapacity);
    const tracksProduced = Math.floor(beatsToUse / 5);
    newState.resources.beats -= beatsToUse;
    newState.resources.tracks += tracksProduced;
  }

  // Performance: convert tracks to fans
  const performanceLevel = newState.skills.performance;
  if (performanceLevel > 0 && newState.resources.tracks >= 1) {
    const performanceCapacity = performanceLevel * calculateProduction('performance', performanceLevel, mult);
    const tracksToUse = Math.min(newState.resources.tracks, performanceCapacity);
    newState.resources.tracks -= tracksToUse;
    newState.resources.fans += tracksToUse;
  }

  // Marketing: generate cash from fans
  const marketingLevel = newState.skills.marketing;
  if (marketingLevel > 0 && newState.resources.fans > 0) {
    const baseMultiplier = 1 + marketingLevel * 0.1;
    const cashGenerated = Math.floor(newState.resources.fans * baseMultiplier * 0.1);
    newState.resources.cash += cashGenerated;
  }

  // Collaboration: XP bonus
  const collabLevel = newState.skills.collaboration;
  const xpMultiplier = 1 + collabLevel * 0.15;
  
  // XP gained per tick based on total activity
  const xpGained = (beatOutput + businessOutput) * 0.1 * xpMultiplier;
  newState.resources.xp += xpGained;
  newState.totalXp += xpGained;

  return newState;
}

export function upgradeSkill(state: GameState, skillName: string): { success: boolean; state: GameState; error?: string } {
  const level = state.skills[skillName];
  
  if (level >= MAX_LEVEL) {
    return { success: false, state, error: "Skill already at max level" };
  }

  const cost = calculateUpgradeCost(skillName, level);
  
  if (!canAfford(state, cost)) {
    return { success: false, state, error: "Not enough cash" };
  }

  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  newState.resources.cash -= cost;
  newState.skills[skillName] += 1;

  return { success: true, state: newState };
}

export function calculatePrestige(state: GameState): { canPrestige: boolean; cost: number; bonus: number } {
  const cost = Math.floor(PRESTIGE_REQUIRED_XP * Math.pow(1.5, state.prestige));
  return {
    canPrestige: state.resources.xp >= cost,
    cost,
    bonus: PRESTIGE_MULTIPLIER,
  };
}

export function doPrestige(state: GameState): { success: boolean; state: GameState; error?: string } {
  const { canPrestige, cost } = calculatePrestige(state);
  
  if (!canPrestige) {
    return { success: false, state, error: "Not enough XP to prestige" };
  }

  const newState = createDefaultState();
  newState.prestige = state.prestige + 1;
  newState.prestigeMultiplier = getPrestigeMultiplier(newState.prestige);

  return { success: true, state: newState };
}

// Save/Load functions
const STORAGE_KEY = 'idleLabelSave';

export function saveGame(state: GameState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function loadGame(): GameState | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as GameState;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function hasSave(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
  return false;
}

export function resetGame(): GameState {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return createDefaultState();
}