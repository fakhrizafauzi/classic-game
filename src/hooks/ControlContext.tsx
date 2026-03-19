import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GameAction, ControlState } from '../types/controls';

interface ControlContextType {
  controls: ControlState;
  pressAction: (action: GameAction) => void;
  releaseAction: (action: GameAction) => void;
  // Theme Switching
  theme: number;
  themeName: string;
  nextTheme: () => void;
}

const ControlContext = createContext<ControlContextType | undefined>(undefined);

const initialControls: ControlState = {
  UP: false, DOWN: false, LEFT: false, RIGHT: false,
  A: false, B: false, SELECT: false, START: false,
};

// 10 Color Themes for Gamepad
const THEMES = [
    { name: 'Classic Gray', color: '#c4c4c4' },
    { name: 'Atomic Purple', color: '#6d5acd' },
    { name: 'Loud Yellow', color: '#ffd700' },
    { name: 'Ice Blue', color: '#add8e6' },
    { name: 'Jet Black', color: '#1a1a1a' },
    { name: 'Berry Red', color: '#d21f3c' },
    { name: 'Jungle Green', color: '#228b22' },
    { name: 'Silver Plated', color: '#e5e4e2' },
    { name: 'Sunny Orange', color: '#ff8c00' },
    { name: 'Cyber Pink', color: '#ff69b4' }
];

export const ControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [controls, setControls] = useState<ControlState>(initialControls);
  const [themeIndex, setThemeIndex] = useState(0);

  const nextTheme = useCallback(() => {
    setThemeIndex(prev => (prev + 1) % THEMES.length);
  }, []);

  const pressAction = useCallback((action: GameAction) => {
    setControls(prev => ({ ...prev, [action]: true }));
  }, []);

  const releaseAction = useCallback((action: GameAction) => {
    setControls(prev => ({ ...prev, [action]: false }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, GameAction> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
        z: 'B', x: 'A', j: 'B', k: 'A',
        Enter: 'START', Shift: 'SELECT', ' ': 'START',
      };
      const action = keyMap[e.key];
      if (action) { e.preventDefault(); pressAction(action); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap: Record<string, GameAction> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
        z: 'B', x: 'A', j: 'B', k: 'A',
        Enter: 'START', Shift: 'SELECT', ' ': 'START',
      };
      const action = keyMap[e.key];
      if (action) releaseAction(action);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressAction, releaseAction]);

  return (
    <ControlContext.Provider value={{ 
        controls, 
        pressAction, 
        releaseAction, 
        theme: themeIndex, 
        themeName: THEMES[themeIndex].name,
        nextTheme 
    }}>
       <div className="theme-wrapper" style={{ '--gb-body-color': THEMES[themeIndex].color } as React.CSSProperties}>
          {children}
       </div>
    </ControlContext.Provider>
  );
};

export const useGameControls = () => {
  const context = useContext(ControlContext);
  if (!context) throw new Error('useGameControls must be used within ControlProvider');
  return context;
};
export { ControlContext };
