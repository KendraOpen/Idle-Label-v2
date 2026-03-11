'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  createDefaultState,
  gameTick,
  upgradeSkill,
  doPrestige,
  getPrestigeInfo,
  getUpgradeCost,
  saveGame,
  loadGame,
  clearSave,
  SKILLS,
  MAX_LEVEL,
  SkillName,
} from '@/lib/game';

export function useGame() {
  const [state, setState] = useState<GameState>(createDefaultState());
  const [ready, setReady] = useState(false);

  // Load on mount
  useEffect(() => {
    const saved = loadGame();
    if (saved) setState(saved);
    setReady(true);
  }, []);

  // Game tick every second
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      setState(prev => gameTick(prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [ready]);

  // Auto-save every 30s
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => saveGame(state), 30000);
    return () => clearInterval(interval);
  }, [state, ready]);

  const upgrade = useCallback((skill: SkillName) => {
    setState(prev => {
      const next = upgradeSkill(prev, skill);
      if (next) saveGame(next);
      return next || prev;
    });
  }, []);

  const clickToEarn = useCallback(() => {
    setState(prev => ({
      ...prev,
      resources: { ...prev.resources, beats: prev.resources.beats + 1 }
    }));
  }, []);

  const prestige = useCallback(() => {
    setState(prev => {
      const next = doPrestige(prev);
      if (next) saveGame(next);
      return next || prev;
    });
  }, []);

  const save = useCallback(() => saveGame(state), [state]);
  const reset = useCallback(() => { clearSave(); setState(createDefaultState()); }, []);

  return {
    state,
    isLoading: !ready,
    upgrade,
    clickToEarn,
    prestige,
    save,
    reset,
    prestigeInfo: getPrestigeInfo(state),
    getCost: (skill: SkillName) => getUpgradeCost(skill, state.skills[skill]),
    SKILLS,
    MAX_LEVEL,
  };
}