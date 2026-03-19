import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameControls } from '../../hooks/ControlContext';
import './Game2048.css';

type Grid = number[][];

const Game2048: React.FC = () => {
    const { controls } = useGameControls();
    const [grid, setGrid] = useState<Grid>(Array(4).fill(0).map(() => Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const lastControls = useRef(controls);

    const spawn = useCallback((currentGrid: Grid): Grid => {
        const empty: [number, number][] = [];
        currentGrid.forEach((row, r) => row.forEach((cell, c) => { if(cell === 0) empty.push([r, c]); }));
        if (empty.length === 0) return currentGrid;
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return newGrid;
    }, []);

    const init = useCallback(() => {
        const g = spawn(Array(4).fill(0).map(() => Array(4).fill(0)));
        setGrid(spawn(g));
        setScore(0);
        setGameOver(false);
    }, [spawn]);

    useEffect(() => { init(); }, [init]);

    const slideLeft = (row: number[]) => {
        let filtered = row.filter(val => val !== 0);
        let currentScore = 0;
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                currentScore += filtered[i];
                filtered[i + 1] = 0;
            }
        }
        filtered = filtered.filter(val => val !== 0);
        while (filtered.length < 4) filtered.push(0);
        return { row: filtered, score: currentScore };
    };

    const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (gameOver) return;
        let newGrid = grid.map(row => [...row]);
        let moved = false;
        let totalAddedScore = 0;

        if (direction === 'LEFT') {
            for (let r = 0; r < 4; r++) {
                const res = slideLeft(newGrid[r]);
                if (JSON.stringify(newGrid[r]) !== JSON.stringify(res.row)) moved = true;
                newGrid[r] = res.row;
                totalAddedScore += res.score;
            }
        } else if (direction === 'RIGHT') {
            for (let r = 0; r < 4; r++) {
                const reversed = [...newGrid[r]].reverse();
                const res = slideLeft(reversed);
                const finalRow = [...res.row].reverse();
                if (JSON.stringify(newGrid[r]) !== JSON.stringify(finalRow)) moved = true;
                newGrid[r] = finalRow;
                totalAddedScore += res.score;
            }
        } else if (direction === 'UP') {
            for (let c = 0; c < 4; c++) {
                const column = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
                const res = slideLeft(column);
                if (JSON.stringify(column) !== JSON.stringify(res.row)) moved = true;
                for (let r = 0; r < 4; r++) newGrid[r][c] = res.row[r];
                totalAddedScore += res.score;
            }
        } else if (direction === 'DOWN') {
            for (let c = 0; c < 4; c++) {
                const column = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
                const res = slideLeft(column);
                const reversed = [...res.row].reverse();
                if (JSON.stringify([newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]]) !== JSON.stringify(reversed)) moved = true;
                for (let r = 0; r < 4; r++) newGrid[r][c] = reversed[r];
                totalAddedScore += res.score;
            }
        }

        if (moved) {
            const spawned = spawn(newGrid);
            setGrid(spawned);
            setScore(s => s + totalAddedScore);
            const checkGameOver = (g: Grid) => {
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        if (g[r][c] === 0) return false;
                        if (r < 3 && g[r][c] === g[r + 1][c]) return false;
                        if (c < 3 && g[r][c] === g[r][c + 1]) return false;
                    }
                }
                return true;
            };
            if (checkGameOver(spawned)) setGameOver(true);
        }
    }, [grid, gameOver, spawn]);

    useEffect(() => {
        if (!gameOver) {
            if (controls.UP && !lastControls.current.UP) move('UP');
            if (controls.DOWN && !lastControls.current.DOWN) move('DOWN');
            if (controls.LEFT && !lastControls.current.LEFT) move('LEFT');
            if (controls.RIGHT && !lastControls.current.RIGHT) move('RIGHT');
        }
        if (controls.START && !lastControls.current.START) init();
        lastControls.current = { ...controls };
    }, [controls, move, gameOver, init]);

    return (
        <div className="game-container game-2048">
            <div className="header-2048">
                <div className="score-box">
                    <span className="label">SCORE</span>
                    <span className="val">{score}</span>
                </div>
                <div className="title-2048">2048</div>
            </div>

            <div className="grid-2048-wrapper">
                <div className="grid-2048">
                    {grid.map((row, r) => row.map((cell, c) => (
                        <div key={`${r}-${c}`} className={`tile-container t-${cell}`}>
                            <AnimatePresence mode='popLayout'>
                                {cell !== 0 && (
                                    <motion.div 
                                        key={cell + '-' + r + '-' + c}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`tile tile-${cell}`}
                                    >
                                        {cell}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )))}
                </div>
            </div>

            {gameOver && (
                <div className="overlay overlay-2048">
                    <h2>FINISH</h2>
                    <p>SCORE: {score}</p>
                    <span>START TO RETRY</span>
                </div>
            )}
        </div>
    );
};

export default Game2048;
