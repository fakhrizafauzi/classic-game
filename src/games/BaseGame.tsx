import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameControls } from '../hooks/ControlContext';
import './GameStyles.css';

interface BaseGameProps {
  name: string;
}

const BaseGame: React.FC<BaseGameProps> = ({ name }) => {
  const { controls } = useGameControls();
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const lastUpdate = useRef(0);

  // Game Loop Sederhana
  const update = useCallback((time: number) => {
    const dt = time - lastUpdate.current;
    if (dt > 100) { // Update setiap 100ms
        setPos((prev) => {
            let nx = prev.x;
            let ny = prev.y;
            if (controls.LEFT) nx = Math.max(0, nx - 5);
            if (controls.RIGHT) nx = Math.min(90, nx + 5);
            if (controls.UP) ny = Math.max(0, ny - 5);
            if (controls.DOWN) ny = Math.min(90, ny + 5);
            
            if (nx !== prev.x || ny !== prev.y) {
                setScore(s => s + 1);
            }
            return { x: nx, y: ny };
        });
        lastUpdate.current = time;
    }
    requestAnimationFrame(update);
  }, [controls]);

  useEffect(() => {
    const id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [update]);

  return (
    <div className="game-container">
      <div className="game-header">
        <span>{name}</span>
        <span>SCORE: {score}</span>
      </div>
      
      <div className="game-screen-area">
        {/* Entity yang digerakkan */}
        <div 
          className="player-box"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        />
        
        <div className="game-hint">
          {controls.A && <span className="action-badge">A PRESSED!</span>}
          {controls.B && <span className="action-badge">B PRESSED!</span>}
        </div>
      </div>

      <div className="game-footer">
        PRESS START TO RESET
      </div>
    </div>
  );
};

export default BaseGame;
