import React, { useEffect, useState } from 'react';
import { ScoreSystem } from '../utils/ScoreSystem';

interface ScoreDisplayProps {
  scoreSystem: ScoreSystem;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ scoreSystem }) => {
  const [currentScore, setCurrentScore] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [highScore, setHighScore] = useState(scoreSystem.highScore);

  useEffect(() => {
    setCurrentScore(scoreSystem.currentScore);
    setComboMultiplier(scoreSystem.comboMultiplier);
    setHighScore(scoreSystem.highScore);
  }, [scoreSystem.currentScore, scoreSystem.comboMultiplier, scoreSystem.highScore]);

  return (
    <div className="score-display">
      <div className="score-current">Score: {currentScore}</div>
      <div className="score-combo" style={{ color: comboMultiplier > 1 ? '#ff4757' : '#fff' }}>
        Combo: x{comboMultiplier}
      </div>
      <div className="score-high">High Score: {highScore}</div>
    </div>
  );
};
