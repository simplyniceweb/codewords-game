import React from 'react';
import './GameBoard.css';

const GameBoard = ({ maskedWord, remainingAttempts, status, hint }) => {
  return (
    <div className="game-board">
      {/* Your existing word display */}
      <div className="word-display">
        {maskedWord.split(' ').map((char, index) => (
          <span key={index} className="letter-tile">{char}</span>
        ))}
      </div>
      
      {/* Add hint display */}
      {hint && (
        <div className="ai-hint">
          🤖 Hint: {hint}
        </div>
      )}
      
      <div className="attempts">
        Remaining Attempts: {remainingAttempts}
      </div>
      
      {/* Rest of your component */}
    </div>
  );
};

export default GameBoard;