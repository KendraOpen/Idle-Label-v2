'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  resetGame,
  SKILLS,
  MAX_LEVEL,
} from '@/lib/game';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(createDefaultState());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load game on mount
  useEffect(() => {
    try {
      const saved = loadGame();
      if (saved) {
        setGameState(saved);
      }
    } catch (e) {
      console.error('Failed to load game:', e);
    }
    setLoaded(true);
  }, []);

  // Game tick - runs every 1 second
  useEffect(() => {
    if (!loaded) return;

    const tick = () => {
      setGameState(prev => {
        try {
          return processTick(prev);
        } catch (e) {
          console.error('Tick error:', e);
          return prev;
        }
      });
    };

    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [loaded]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!loaded) return;
    
    const saveInterval = setInterval(() => {
      saveGame(gameState);
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, [gameState, loaded]);

  const upgrade = useCallback((skillName: string) => {
    const result = upgradeSkill(gameState, skillName);
    if (result.success) {
      setGameState(result.state);
      saveGame(result.state);
    }
  }, [gameState]);

  const prestige = useCallback(() => {
    const result = doPrestige(gameState);
    if (result.success) {
      setGameState(result.state);
      saveGame(result.state);
    }
  }, [gameState]);

  const save = useCallback(() => {
    saveGame(gameState);
  }, [gameState]);

  const reset = useCallback(() => {
    const newState = resetGame();
    setGameState(newState);
  }, []);

  return {
    state: gameState,
    isLoading: !loaded,
    error,
    upgrade,
    prestige,
    save,
    reset,
    calculatePrestige: calculatePrestige(gameState),
    calculateUpgradeCost: (skillName: string, level: number) => calculateUpgradeCost(skillName, level),
    SKILLS,
    MAX_LEVEL,
  };
}