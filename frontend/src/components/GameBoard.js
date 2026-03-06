import React from 'react';
import './GameBoard.css';

const GameBoard = ({ maskedWord, remainingAttempts, maxAttempts, status }) => {
    // Calculate attempt percentage for visual progress
    const attemptPercentage = (remainingAttempts / maxAttempts) * 100;
    
    return (
        <div className="game-board">
            <div className="word-display">
                {maskedWord.split(' ').map((char, index) => (
                    <span key={index} className="letter-tile">
                        {char}
                    </span>
                ))}
            </div>
            
            <div className="attempts-container">
                <div className="attempts-label">
                    Attempts: {remainingAttempts} / {maxAttempts}
                </div>
                <div className="attempts-bar">
                    <div 
                        className="attempts-progress"
                        style={{ 
                            width: `${attemptPercentage}%`,
                            backgroundColor: 
                                attemptPercentage > 66 ? '#4caf50' :
                                attemptPercentage > 33 ? '#ff9800' : '#f44336'
                        }}
                    />
                </div>
            </div>
            
            {status !== 'IN_PROGRESS' && (
                <div className={`game-status ${status.toLowerCase()}`}>
                    {status === 'WON' ? '🎉 You Won!' : '😢 Game Over - You Lost!'}
                </div>
            )}
        </div>
    );
};

export default GameBoard;