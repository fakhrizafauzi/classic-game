import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameControls } from '../../hooks/ControlContext';
import './GameTetris.css';

const COLS = 10;
const ROWS = 20;

const TETROMINOS = {
  I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#1a331a' },
  J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#1a331a' },
  L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#1a331a' },
  O: { shape: [[1, 1], [1, 1]], color: '#1a331a' },
  S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#1a331a' },
  T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#1a331a' },
  Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#1a331a' },
};

const RANDOM_PIECE = (isNext = false) => {
  const keys = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
  const type = keys[Math.floor(Math.random() * keys.length)];
  return { ...TETROMINOS[type], pos: { x: 3, y: isNext ? 0 : -1 } };
};

const GameTetris: React.FC = () => {
  const { controls } = useGameControls();
  const [grid, setGrid] = useState<string[][]>(() => Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
  const [piece, setPiece] = useState(RANDOM_PIECE);
  const [nextPiece, setNextPiece] = useState(() => RANDOM_PIECE(true));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const lastControls = useRef(controls);

  const collision = useCallback((p: any, g: string[][], offset = { x: 0, y: 0 }) => {
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < p.shape[y].length; x++) {
        if (p.shape[y][x] !== 0) {
          const nx = p.pos.x + x + offset.x;
          const ny = p.pos.y + y + offset.y;
          
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && g[ny][nx] !== '') return true;
        }
      }
    }
    return false;
  }, []);

  const rotate = (matrix: number[][]) => {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
  };

  const merge = useCallback(() => {
    setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const ny = piece.pos.y + y;
                    const nx = piece.pos.x + x;
                    if (ny >= 0 && ny < ROWS) newGrid[ny][nx] = piece.color;
                }
            });
        });

        // Clear lines
        let linesRemoved = 0;
        const filtered = newGrid.filter(row => {
            const isFull = row.every(cell => cell !== '');
            if(isFull) linesRemoved++;
            return !isFull;
        });

        while(filtered.length < ROWS) filtered.unshift(Array(COLS).fill(''));
        
        if(linesRemoved > 0) setScore(s => s + (linesRemoved * 100));

        // Use nextPiece and spawn another
        const current = { ...nextPiece, pos: { x: 3, y: -1 } };
        if(collision(current, filtered)) {
            setGameOver(true);
        }
        setPiece(current);
        setNextPiece(RANDOM_PIECE(true));
        return filtered;
    });
  }, [piece, nextPiece, collision]);

  const drop = useCallback(() => {
    if (!collision(piece, grid, { x: 0, y: 1 })) {
        setPiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
    } else {
        merge();
    }
  }, [piece, grid, collision, merge]);

  const move = useCallback((dir: number) => {
    if (!collision(piece, grid, { x: dir, y: 0 })) {
        setPiece(prev => ({ ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } }));
    }
  }, [piece, grid, collision]);

  const playerRotate = useCallback(() => {
    const rotated = rotate(piece.shape);
    const newPiece = { ...piece, shape: rotated };
    if (!collision(newPiece, grid)) {
        setPiece(newPiece);
    }
  }, [piece, grid, collision]);

  // Gravity Loop - DOWN makes it drop faster
  useEffect(() => {
    if (gameOver) return;
    const interval = controls.DOWN ? 40 : 800; // Faster down speed
    const timer = setInterval(() => { drop(); }, interval);
    return () => clearInterval(timer);
  }, [drop, controls.DOWN, gameOver]);

  // Input Handler
  useEffect(() => {
    if (gameOver) {
        if (controls.START && !lastControls.current.START) {
            setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
            setScore(0);
            setPiece(RANDOM_PIECE());
            setNextPiece(RANDOM_PIECE(true));
            setGameOver(false);
        }
    } else {
        if (controls.LEFT && !lastControls.current.LEFT) move(-1);
        if (controls.RIGHT && !lastControls.current.RIGHT) move(1);
        if ((controls.UP && !lastControls.current.UP) || (controls.A && !lastControls.current.A)) playerRotate();
    }
    lastControls.current = { ...controls };
  }, [controls, move, playerRotate, gameOver]);

  return (
    <div className="game-container game-tetris">
      <div className="tetris-main">
        <div className="tetris-board">
            {grid.map((row, y) =>
            row.map((cell, x) => {
                let color = cell;
                const py = y - piece.pos.y;
                const px = x - piece.pos.x;
                if (py >= 0 && py < piece.shape.length && px >= 0 && px < piece.shape[py].length) {
                    if (piece.shape[py][px] !== 0) color = piece.color;
                }
                return <div key={`${y}-${x}`} className="t-cell" style={{ background: color || 'transparent' }} />;
            })
            )}
            
            {gameOver && (
            <div className="overlay">
                <h2>GAME OVER</h2>
                <p>START TO RETRY</p>
            </div>
            )}
        </div>

        <div className="tetris-aside">
            <div className="stat-v">
                <span className="label">SCORE</span>
                <span className="v">{score}</span>
            </div>
            
            <div className="next-preview">
                <span className="label">NEXT</span>
                <div className="preview-grid">
                    {nextPiece.shape.map((row, r) => (
                        <div key={r} className="p-row">
                            {row.map((cell, c) => (
                                <div 
                                    key={c} 
                                    className="p-cell" 
                                    style={{ background: cell ? nextPiece.color : 'transparent' }} 
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      <div className="game-footer">
        UP/A: ROTATE • DOWN: DROP
      </div>
    </div>
  );
};

export default GameTetris;
