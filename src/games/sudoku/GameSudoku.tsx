import React, { useState, useEffect, useRef } from 'react';
import { useGameControls } from '../../hooks/ControlContext';
import './GameSudoku.css';

const SIZE = 9;

const INITIAL_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const GameSudoku: React.FC = () => {
    const { controls } = useGameControls();
    const [grid, setGrid] = useState<number[][]>(() => INITIAL_PUZZLE.map(row => [...row]));
    const [original] = useState<boolean[][]>(() => INITIAL_PUZZLE.map(row => row.map(v => v !== 0)));
    const [cursor, setCursor] = useState({ r: 0, c: 0 });
    const lastControls = useRef(controls);

    const updateValue = (delta: number) => {
        if (original[cursor.r][cursor.c]) return;
        const newGrid = grid.map(row => [...row]);
        let nextVal = newGrid[cursor.r][cursor.c] + delta;
        if (nextVal > 9) nextVal = 0;
        if (nextVal < 0) nextVal = 9;
        newGrid[cursor.r][cursor.c] = nextVal;
        setGrid(newGrid);
    };

    useEffect(() => {
        if (controls.DOWN && !lastControls.current.DOWN) setCursor(p => ({ ...p, r: (p.r + 1) % SIZE }));
        if (controls.UP && !lastControls.current.UP) setCursor(p => ({ ...p, r: (p.r - 1 + SIZE) % SIZE }));
        if (controls.RIGHT && !lastControls.current.RIGHT) setCursor(p => ({ ...p, c: (p.c + 1) % SIZE }));
        if (controls.LEFT && !lastControls.current.LEFT) setCursor(p => ({ ...p, c: (p.c - 1 + SIZE) % SIZE }));

        if (controls.A && !lastControls.current.A) updateValue(1);
        if (controls.B && !lastControls.current.B) updateValue(-1);

        lastControls.current = { ...controls };
    }, [controls, cursor, grid]);

    return (
        <div className="game-container game-sudoku">
            <div className="sudoku-header">SUDOKU</div>
            
            <div className="sudoku-grid">
                {grid.map((row, r) => (
                    row.map((val, c) => {
                        const isSelected = cursor.r === r && cursor.c === c;
                        const isOrig = original[r][c];
                        const rowEdge = (r + 1) % 3 === 0 && r < SIZE - 1;
                        const colEdge = (c + 1) % 3 === 0 && c < SIZE - 1;

                        return (
                            <div 
                                key={`${r}-${c}`} 
                                className={`s-cell ${isSelected ? 'cursor' : ''} ${isOrig ? 'orig' : ''}`}
                                style={{
                                    borderBottom: rowEdge ? '2px solid #1a331a' : undefined,
                                    borderRight: colEdge ? '2px solid #1a331a' : undefined
                                }}
                            >
                                {val !== 0 ? val : ''}
                            </div>
                        );
                    })
                ))}
            </div>

            <div className="game-footer">
                A: INC • B: DEC • DPAD: MOVE
            </div>
        </div>
    );
};

export default GameSudoku;
