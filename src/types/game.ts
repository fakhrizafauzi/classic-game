export interface GameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';
