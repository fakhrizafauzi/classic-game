import React from 'react';
import { motion } from 'framer-motion';
import { useGameControls } from '../hooks/ControlContext';
import type { GameAction } from '../types/controls';
import './Gamepad.css';

const Gamepad: React.FC = () => {
  const { pressAction, releaseAction } = useGameControls();

  const handlePress = (action: GameAction) => { pressAction(action); };
  const handleRelease = (action: GameAction) => { releaseAction(action); };

  const ControlButton = ({ 
    action, 
    className, 
    children 
  }: { 
    action: GameAction; 
    className?: string; 
    children?: React.ReactNode 
  }) => (
    <motion.button
      className={`gp-btn ${className || ''}`}
      onMouseDown={() => handlePress(action)}
      onMouseUp={() => handleRelease(action)}
      onMouseLeave={() => handleRelease(action)}
      onClick={() => { handlePress(action); setTimeout(() => handleRelease(action), 100); }}
      onTouchStart={(e) => { e.preventDefault(); handlePress(action); }}
      onTouchEnd={(e) => { e.preventDefault(); handleRelease(action); }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="gamepad-container">
      {/* Row 1: D-Pad and A/B */}
      <div className="main-controls">
        <div className="dpad">
          {/* Visual Cross Background */}
          <div className="dpad-cross" />
          <div className="dpad-center-cap" />
          
          {/* Clickable Buttons */}
          <ControlButton action="UP" className="dpad-btn dpad-up" />
          <ControlButton action="DOWN" className="dpad-btn dpad-down" />
          <ControlButton action="LEFT" className="dpad-btn dpad-left" />
          <ControlButton action="RIGHT" className="dpad-btn dpad-right" />
        </div>

        <div className="action-btns">
          <div className="action-btn-group">
            <ControlButton action="B" className="btn-round" />
            <span className="btn-label">B</span>
          </div>
          <div className="action-btn-group">
            <ControlButton action="A" className="btn-round" />
            <span className="btn-label">A</span>
          </div>
        </div>
      </div>

      {/* Row 2: Select & Start */}
      <div className="system-section">
        <div className="system-btn-group">
          <div className="btn-pill-container">
            <ControlButton action="SELECT" className="btn-rect" />
            <span className="system-label">SELECT</span>
          </div>
          <div className="btn-pill-container">
            <ControlButton action="START" className="btn-rect" />
            <span className="system-label">START</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamepad;
