'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  createDefaultState,
  processTick,
  upgradeSkill,
  doPrestige,
  calculatePrestige,
  calculateUpgradeCost,
  saveGame,
  loadGame,
  hasSave,
  resetGame,
  SKILLS,
  MAX_LEVEL,
} from '@/lib/game';

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game on mount
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setState(saved);
    } else {
      setState(createDefaultState());
    }
    setIsLoading(false);
  }, []);

  // Auto-tick every 1 second
  useEffect(() => {
    if (!state || isLoading) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev) return prev;
        return processTick(prev);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state, isLoading]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!state || isLoading) return;

    const interval = setInterval(() => {
      saveGame(state);
    }, 30000);

    return () => clearInterval(interval);
  }, [state, isLoading]);

  const upgrade = useCallback((skillName: string) => {
    if (!state) return;
    const result = upgradeSkill(state, skillName);
    if (result.success) {
      setState(result.state);
      saveGame(result.state);
    }
  }, [state]);

  const prestige = useCallback(() => {
    if (!state) return;
    const result = doPrestige(state);
    if (result.success) {
      setState(result.state);
      saveGame(result.state);
    }
  }, [state]);

  const save = useCallback(() => {
    if (state) {
      saveGame(state);
    }
  }, [state]);

  const reset = useCallback(() => {
    setState(resetGame());
  }, []);

  return {
    state,
    isLoading,
    upgrade,
    prestige,
    save,
    reset,
    calculatePrestige: state ? calculatePrestige(state) : null,
    calculateUpgradeCost: (skillName: string, level: number) => calculateUpgradeCost(skillName, level),
    SKILLS,
    MAX_LEVEL,
  };
}