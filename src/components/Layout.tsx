import React from 'react';
import Gamepad from './Gamepad';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const ArcadeLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="arcade-container">
      {/* Layar Luar (Bezel) */}
      <div className="arcade-bezel">
        {/* Layar Dalam (Screen) */}
        <div className="arcade-screen pixel-grid">
          {children}
        </div>

        {/* Branding (Handheld Name) */}
        <div className="arcade-brand">
            <span>DOT MATRIX GAME</span>
        </div>
      </div>

      {/* Kontroler Handheld */}
      <Gamepad />

      {/* Speaker Grill (Hiasan) */}
      <div className="speaker-grill">
          <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  );
};

export default ArcadeLayout;
