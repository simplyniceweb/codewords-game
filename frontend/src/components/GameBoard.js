import React from 'react';
import './GameBoard.css';

const GameBoard = ({ maskedWord, remainingAttempts, status }) => {
  return (
    <div className="game-board">
      <div className="word-display">
        {maskedWord.split(' ').map((char, index) => (
          <span key={index} className="letter-tile">
            {char}
          </span>
        ))}
      </div>
      <div className="attempts">
        Remaining Attempts: {remainingAttempts}
      </div>
      {status !== 'IN_PROGRESS' && (
        <div className={`game-status ${status.toLowerCase()}`}>
          Game Over! You {status === 'WON' ? 'Won! 🎉' : 'Lost! 😢'}
        </div>
      )}
    </div>
  );
};

export default GameBoard;