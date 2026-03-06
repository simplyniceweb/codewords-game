import React from 'react';
import './DifficultySelector.css';

const DifficultySelector = ({ onSelect, selected, disabled }) => {
    const difficulties = [
        { id: 'easy', name: 'Easy', color: '#4caf50', attempts: 8, wordLength: '4-5' },
        { id: 'medium', name: 'Medium', color: '#ff9800', attempts: 6, wordLength: '5-6' },
        { id: 'hard', name: 'Hard', color: '#f44336', attempts: 5, wordLength: '6-8' },
        { id: 'expert', name: 'Expert', color: '#9c27b0', attempts: 4, wordLength: '7-10' }
    ];

    return (
        <div className="difficulty-selector">
            <h3>Select Difficulty:</h3>
            <div className="difficulty-buttons">
                {difficulties.map(diff => (
                    <button
                        key={diff.id}
                        className={`difficulty-btn ${selected === diff.id ? 'active' : ''}`}
                        style={{ 
                            backgroundColor: selected === diff.id ? diff.color : '#e0e0e0',
                            color: selected === diff.id ? 'white' : '#333'
                        }}
                        onClick={() => onSelect(diff.id)}
                        disabled={disabled}
                    >
                        <span className="difficulty-name">{diff.name}</span>
                        <span className="difficulty-details">
                            {diff.attempts} attempts • {diff.wordLength} letters
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DifficultySelector;