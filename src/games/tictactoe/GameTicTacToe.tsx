import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameControls } from '../../hooks/ControlContext';
import { X, Circle, Trophy, User, Cpu } from 'lucide-react';
import './GameTicTacToe.css';

const GameTicTacToe: React.FC = () => {
  const { controls } = useGameControls();
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [cursor, setCursor] = useState(0);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O'>('X');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const lastControls = useRef(controls);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: lines[i] };
        }
    }
    return squares.includes(null) ? null : { winner: 'Draw', line: null };
  };

  const resetGame = useCallback(() => {
    const playerStarts = Math.random() > 0.5;
    const symbol = Math.random() > 0.5 ? 'X' : 'O';
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinLine(null);
    setPlayerSymbol(symbol);
    setIsPlayerTurn(playerStarts);
  }, []);

  useEffect(() => { resetGame(); }, [resetGame]);

  const makeMove = (i: number, symbol: string) => {
    if (winner || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = symbol;
    setBoard(newBoard);
    const result = calculateWinner(newBoard);
    if (result) {
        setWinner(result.winner);
        setWinLine(result.line);
    } else {
        setIsPlayerTurn(!isPlayerTurn);
    }
  };

  useEffect(() => {
    if (!winner && !isPlayerTurn) {
        const timer = setTimeout(() => {
            const aiSys = playerSymbol === 'X' ? 'O' : 'X';
            const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
            
            // AI Basic Logic
            for(let i of empty) { const t = [...board]; t[i] = aiSys; if(calculateWinner(t)?.winner === aiSys) { makeMove(i, aiSys); return; } }
            for(let i of empty) { const t = [...board]; t[i] = playerSymbol; if(calculateWinner(t)?.winner === playerSymbol) { makeMove(i, aiSys); return; } }
            if(board[4] === null) { makeMove(4, aiSys); return; }
            makeMove(empty[Math.floor(Math.random() * empty.length)], aiSys);
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board, playerSymbol]);

  useEffect(() => {
    if (!winner && isPlayerTurn) {
        if (controls.DOWN && !lastControls.current.DOWN) setCursor(c => (c + 3) % 9);
        if (controls.UP && !lastControls.current.UP) setCursor(c => (c - 3 + 9) % 9);
        if (controls.RIGHT && !lastControls.current.RIGHT) setCursor(c => (c % 3 === 2 ? c - 2 : c + 1));
        if (controls.LEFT && !lastControls.current.LEFT) setCursor(c => (c % 3 === 0 ? c + 2 : c - 1));
        if (controls.A && !lastControls.current.A) makeMove(cursor, playerSymbol);
    }
    if (controls.START && !lastControls.current.START) resetGame();
    lastControls.current = { ...controls };
  }, [controls, cursor, board, winner, isPlayerTurn, playerSymbol]);

  return (
    <div className="game-container game-ttt">
      <div className="ttt-header">
        <div className={`player-box ${isPlayerTurn ? 'active' : ''}`}>
           <User size={16} /> <span>{playerSymbol}</span>
        </div>
        <div className="ttt-title">TIC-TAC-TOE</div>
        <div className={`player-box ${!isPlayerTurn ? 'active' : ''}`}>
           <Cpu size={16} /> <span>{playerSymbol === 'X' ? 'O' : 'X'}</span>
        </div>
      </div>

      <div className="ttt-board-container">
        <div className="ttt-main-grid">
            {board.map((cell, i) => (
            <div 
                key={i} 
                className={`ttt-cell ${cursor === i && isPlayerTurn ? 'cursor' : ''} ${winLine?.includes(i) ? 'win' : ''}`}
            >
                {cell === 'X' && <X size={44} strokeWidth={5} />}
                {cell === 'O' && <Circle size={44} strokeWidth={5} />}
            </div>
            ))}
        </div>
      </div>

      {winner && (
        <div className="overlay result-overlay">
          <Trophy size={48} className="trophy-icon" />
          <h2>{winner === 'Draw' ? 'DRAW!' : (winner === playerSymbol ? 'YOU WIN!' : 'AI WINS!')}</h2>
          <p>PRESS START TO RETRY</p>
        </div>
      )}
      
      <div className="ttt-footer">A: MARK • START: RESET</div>
    </div>
  );
};

export default GameTicTacToe;
