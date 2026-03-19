import React, { useState, useEffect, useRef } from 'react';
import { useGameControls } from '../../hooks/ControlContext';
import { Bomb, Flag, RefreshCw } from 'lucide-react';
import './GameMinesweeper.css';

const SIZE = 8; // 8x8 Grid for better balance on small screens
const MINES_COUNT = 10;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const GameMinesweeper: React.FC = () => {
    const { controls } = useGameControls();
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [cursor, setCursor] = useState({ r: 0, c: 0 });
    const [gameOver, setGameOver] = useState<'WIN' | 'LOSE' | null>(null);
    const lastControls = useRef(controls);

    const initGrid = () => {
        let newGrid: Cell[][] = Array(SIZE).fill(null).map(() => 
            Array(SIZE).fill(null).map(() => ({
                isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
            }))
        );

        // Place mines
        let placed = 0;
        while (placed < MINES_COUNT) {
            const r = Math.floor(Math.random() * SIZE);
            const c = Math.floor(Math.random() * SIZE);
            if (!newGrid[r][c].isMine) {
                newGrid[r][c].isMine = true;
                placed++;
            }
        }

        // Calculate neighbor mines
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (newGrid[r][c].isMine) continue;
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (r+i >= 0 && r+i < SIZE && c+j >= 0 && c+j < SIZE) {
                            if (newGrid[r+i][c+j].isMine) count++;
                        }
                    }
                }
                newGrid[r][c].neighborMines = count;
            }
        }
        setGrid(newGrid);
        setGameOver(null);
        setCursor({ r: 0, c: 0 });
    };

    useEffect(() => { initGrid(); }, []);

    const reveal = (r: number, c: number) => {
        if (gameOver || grid[r][c].isRevealed || grid[r][c].isFlagged) return;
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        
        if (newGrid[r][c].isMine) {
            // Lose logic: Reveal all mines
            newGrid.forEach(row => row.forEach(cell => { if(cell.isMine) cell.isRevealed = true; }));
            setGrid(newGrid);
            setGameOver('LOSE');
            return;
        }

        const floodFill = (ri: number, ci: number) => {
            if (ri < 0 || ri >= SIZE || ci < 0 || ci >= SIZE || newGrid[ri][ci].isRevealed) return;
            newGrid[ri][ci].isRevealed = true;
            if (newGrid[ri][ci].neighborMines === 0) {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) floodFill(ri+i, ci+j);
                }
            }
        };

        floodFill(r, c);
        setGrid(newGrid);

        // Win check
        const unrevealedSafe = newGrid.flat().filter(cell => !cell.isMine && !cell.isRevealed).length;
        if (unrevealedSafe === 0) setGameOver('WIN');
    };

    const toggleFlag = (r: number, c: number) => {
        if (gameOver || grid[r][c].isRevealed) return;
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;
        setGrid(newGrid);
    };

    useEffect(() => {
        if (!gameOver && grid.length > 0) {
            if (controls.DOWN && !lastControls.current.DOWN) setCursor(p => ({ ...p, r: (p.r + 1) % SIZE }));
            if (controls.UP && !lastControls.current.UP) setCursor(p => ({ ...p, r: (p.r - 1 + SIZE) % SIZE }));
            if (controls.RIGHT && !lastControls.current.RIGHT) setCursor(p => ({ ...p, c: (p.c + 1) % SIZE }));
            if (controls.LEFT && !lastControls.current.LEFT) setCursor(p => ({ ...p, c: (p.c - 1 + SIZE) % SIZE }));
            
            if (controls.A && !lastControls.current.A) reveal(cursor.r, cursor.c);
            if (controls.B && !lastControls.current.B) toggleFlag(cursor.r, cursor.c);
        }
        if (controls.START && !lastControls.current.START) initGrid();
        lastControls.current = { ...controls };
    }, [controls, cursor, grid, gameOver]);

    return (
        <div className="game-container game-minesweeper">
            <div className="ms-header">
                <div className="ms-stat">
                    <Bomb size={16} /> <span>{MINES_COUNT}</span>
                </div>
                <div className="ms-title">MINESWEEPER</div>
                <div className="ms-stat">
                    <Flag size={16} /> <span>{grid.flat().filter(c => c.isFlagged).length}</span>
                </div>
            </div>

            <div className="ms-grid-container">
                <div className="ms-grid 8x8">
                    {grid.map((row, r) => row.map((cell, c) => (
                        <div 
                            key={`${r}-${c}`} 
                            className={`ms-cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isFlagged ? 'flagged' : ''} ${cursor.r === r && cursor.c === c ? 'cursor' : ''}`}
                        >
                            {cell.isRevealed && cell.isMine && <Bomb size={16} strokeWidth={3} />}
                            {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && cell.neighborMines}
                            {!cell.isRevealed && cell.isFlagged && <Flag size={12} fill="#1a331a" />}
                        </div>
                    )))}
                </div>
            </div>

            {gameOver && (
                <div className="overlay ms-overlay">
                    {gameOver === 'WIN' ? <h2>WELL DONE!</h2> : <h2>BOOM!</h2>}
                    <div className="reset-bar"><RefreshCw size={16} /> START TO RETRY</div>
                </div>
            )}
            <div className="ms-footer">A: REVEAL • B: FLAG • START: RESET</div>
        </div>
    );
};

export default GameMinesweeper;
