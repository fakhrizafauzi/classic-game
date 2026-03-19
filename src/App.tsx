import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link, useNavigate } from 'react-router-dom';
import ArcadeLayout from './components/Layout';
import GameMenu from './pages/GameMenu';
import BaseGame from './games/BaseGame';
import Game2048 from './games/2048/Game2048';
import GameTetris from './games/tetris/GameTetris';
import GameMinesweeper from './games/minesweeper/GameMinesweeper';
import GameNonogram from './games/nonogram/GameNonogram';
import GameSudoku from './games/sudoku/GameSudoku';
import GameTicTacToe from './games/tictactoe/GameTicTacToe';
import { useGameControls, ControlProvider } from './hooks/ControlContext';
import './styles/variables.css';
import './pages/GameMenu.css';

const GameRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { controls } = useGameControls();
    const lastControls = useRef(controls);

    useEffect(() => {
        // Universal Back to Menu via SELECT or B (if not used by game)
        const isGameUsingB = id && ['minesweeper', 'nonogram', 'sudoku'].includes(id);
        
        // SELECT is ALWAYS back to menu across all games
        if (controls.SELECT && !lastControls.current.SELECT) {
            navigate('/');
        }

        // B is back only for some games
        if (controls.B && !lastControls.current.B && !isGameUsingB) {
            navigate('/');
        }
        
        lastControls.current = { ...controls };
    }, [controls, navigate, id]);

    const renderGame = () => {
        switch(id) {
            case '2048': return <Game2048 />;
            case 'tetris': return <GameTetris />;
            case 'minesweeper': return <GameMinesweeper />;
            case 'nonogram': return <GameNonogram />;
            case 'sudoku': return <GameSudoku />;
            case 'tictactoe': return <GameTicTacToe />;
            default: return <BaseGame name={id?.toUpperCase() || "GAME"} />;
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Link 
                to="/" 
                style={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    color: '#1a331a', 
                    fontSize: '10px', 
                    zIndex: 100,
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    background: 'rgba(139, 161, 17, 0.8)',
                    padding: '2px 5px',
                    borderRadius: '2px'
                }}
            >
                EXIT
            </Link>
            {renderGame()}
        </div>
    );
};

const App: React.FC = () => {
  return (
    <Router basename="/classic-game">
      <ControlProvider>
        <ArcadeLayout>
          <Routes>
            <Route path="/" element={<GameMenu />} />
            <Route path="/game/:id" element={<GameRoom />} />
          </Routes>
        </ArcadeLayout>
      </ControlProvider>
    </Router>
  );
};

export default App;
