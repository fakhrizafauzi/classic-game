import React, { useState, useEffect, useRef } from 'react';
import { useGameControls } from '../../hooks/ControlContext';
import { X, CheckCircle2 } from 'lucide-react';
import './GameNonogram.css';

const SIZE = 5;
const PUZZLE = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1]
];

const GameNonogram: React.FC = () => {
  const { controls } = useGameControls();
  const [grid, setGrid] = useState<number[][]>(() => Array(SIZE).fill(0).map(() => Array(SIZE).fill(0)));
  const [cursor, setCursor] = useState({ r: 0, c: 0 });
  const [win, setWin] = useState(false);
  const lastControls = useRef(controls);

  const getClues = (arr: number[]) => {
    const clues: number[] = []; let count = 0;
    arr.forEach(val => { if (val === 1) count++; else if (count > 0) { clues.push(count); count = 0; } });
    if (count > 0) clues.push(count);
    return clues.length > 0 ? clues : [0];
  };

  const rowClues = PUZZLE.map(row => getClues(row));
  const colClues = Array(SIZE).fill(0).map((_, c) => getClues(PUZZLE.map(row => row[c])));

  const checkWin = (currentGrid: number[][]) => {
    for (let r = 0; r < SIZE; r++) { for (let c = 0; c < SIZE; c++) {
        const gridVal = currentGrid[r][c] === 1 ? 1 : 0;
        if (gridVal !== PUZZLE[r][c]) return false;
    } }
    return true;
  };

  const toggleCell = (type: 1 | 2) => {
    if (win) return;
    const newGrid = grid.map(row => [...row]);
    const current = newGrid[cursor.r][cursor.c];
    newGrid[cursor.r][cursor.c] = current === type ? 0 : type;
    setGrid(newGrid);
    if (checkWin(newGrid)) setWin(true);
  };

  useEffect(() => {
    if(!win) {
        if (controls.DOWN && !lastControls.current.DOWN) setCursor(p => ({ ...p, r: (p.r + 1) % SIZE }));
        if (controls.UP && !lastControls.current.UP) setCursor(p => ({ ...p, r: (p.r - 1 + SIZE) % SIZE }));
        if (controls.RIGHT && !lastControls.current.RIGHT) setCursor(p => ({ ...p, c: (p.c + 1) % SIZE }));
        if (controls.LEFT && !lastControls.current.LEFT) setCursor(p => ({ ...p, c: (p.c - 1 + SIZE) % SIZE }));
        if (controls.A && !lastControls.current.A) toggleCell(1);
        if (controls.B && !lastControls.current.B) toggleCell(2);
    }
    if (controls.START && !lastControls.current.START && win) {
        setGrid(Array(SIZE).fill(0).map(() => Array(SIZE).fill(0)));
        setWin(false);
    }
    lastControls.current = { ...controls };
  }, [controls, cursor, grid, win]);

  // Check if clues for a row are "probably" completed
  const isRowSolved = (r: number) => {
    return grid[r].every((val, c) => (val === 1 ? 1 : 0) === PUZZLE[r][c]);
  };
  const isColSolved = (c: number) => {
    return grid.every((row, r) => (row[c] === 1 ? 1 : 0) === PUZZLE[r][c]);
  };

  return (
    <div className="game-container game-nonogram">
      <div className="n-layout">
        <div className="corner-area">
          {win && <CheckCircle2 size={32} color="#1a331a" strokeWidth={3} />}
        </div>
        
        <div className="col-clue-bar">
          {colClues.map((clues, i) => (
            <div key={i} className={`clue-box col ${isColSolved(i) ? 'solved' : ''}`}>
              {clues.map((n, j) => <span key={j}>{n}</span>)}
            </div>
          ))}
        </div>
        
        <div className="row-clue-bar">
          {rowClues.map((clues, i) => (
            <div key={i} className={`clue-box row ${isRowSolved(i) ? 'solved' : ''}`}>
              {clues.map((n, j) => <span key={j}>{n}</span>)}
            </div>
          ))}
        </div>

        <div className="nonogram-main-grid">
          {grid.map((row, r) => row.map((cell, c) => (
            <div 
              key={`${r}-${c}`} 
              className={`n-cell ${cell === 1 ? 'filled' : ''} ${cursor.r === r && cursor.c === c ? 'cursor' : ''}`}
            >
              {cell === 2 && <X size={20} strokeWidth={4} />}
            </div>
          )))}
        </div>
      </div>

      {win && (
        <div className="overlay win-overlay">
          <h2>PUZZLE SOLVED</h2>
          <p>PRESS START TO RETRY</p>
        </div>
      )}
      <div className="n-footer">A: FILL • B: CROSS • DPAD: MOVE</div>
    </div>
  );
};

export default GameNonogram;
