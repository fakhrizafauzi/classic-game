import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Layers, LayoutGrid, Bomb, Grid3X3, Gamepad2, XCircle } from 'lucide-react';
import { useGameControls } from '../hooks/ControlContext';
import './GameMenu.css';

const games = [
  { id: '2048', name: '2048', icon: <Layers size={22} />, path: '/game/2048', desc: 'Merge the tiles!' },
  { id: 'tetris', name: 'TETRIS', icon: <LayoutGrid size={22} />, path: '/game/tetris', desc: 'Clear the lines!' },
  { id: 'minesweeper', name: 'MINESWEEPER', icon: <Bomb size={22} />, path: '/game/minesweeper', desc: 'Find the bombs!' },
  { id: 'nonogram', name: 'NONOGRAM', icon: <Grid3X3 size={22} />, path: '/game/nonogram', desc: 'Solve the puzzle!' },
  { id: 'sudoku', name: 'SUDOKU', icon: <Gamepad2 size={22} />, path: '/game/sudoku', desc: 'Logic grid!' },
  { id: 'tictactoe', name: 'TIC TAC TOE', icon: <XCircle size={22} />, path: '/game/tictactoe', desc: 'Classic 3-in-a-row!' },
];

const GameMenu: React.FC = () => {
  const navigate = useNavigate();
  const { controls, nextTheme, themeName } = useGameControls();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lastControls = useRef(controls);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Navigasi UP/DOWN
    if (controls.DOWN && !lastControls.current.DOWN) setSelectedIndex(prev => (prev + 1) % games.length);
    if (controls.UP && !lastControls.current.UP) setSelectedIndex(prev => (prev - 1 + games.length) % games.length);
    
    // Ganti Tema Gamepad (SELECT)
    if (controls.SELECT && !lastControls.current.SELECT) {
        nextTheme();
    }

    // Eksekusi (A / START)
    if ((controls.A && !lastControls.current.A) || (controls.START && !lastControls.current.START)) {
      navigate(games[selectedIndex].path);
    }
    lastControls.current = { ...controls };
  }, [controls, navigate, selectedIndex, nextTheme]);

  // Smooth Scroll
  useEffect(() => {
    const selectedElement = itemsRef.current[selectedIndex];
    if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="game-menu">
      <div className="menu-header">
         <h1 className="menu-title">DOT MATRIX</h1>
         <div className="menu-sub">{themeName ? themeName.toUpperCase() : 'GAMING SYSTEM'}</div>
      </div>
      
      <div className="menu-body">
        <div className="menu-list">
          {games.map((game, index) => {
            const isSelected = selectedIndex === index;
            return (
              <div 
                key={game.id} 
                ref={el => { itemsRef.current[index] = el; }}
                className={`menu-item-row ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedIndex(index)} 
                onDoubleClick={() => navigate(game.path)}
              >
                <div className="selector">{isSelected && <ChevronRight size={18} strokeWidth={4} />}</div>
                <div className="icon">{game.icon}</div>
                <div className="label-group">
                    <span className="name">{game.name}</span>
                    {isSelected && <span className="desc">{game.desc}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="menu-footer">
         SELECT: 10 THEMES • START: PLAY
      </div>
    </div>
  );
};

export default GameMenu;
