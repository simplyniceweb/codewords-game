import React, { useState } from 'react';
import './CustomDifficulty.css';

const CustomDifficulty = ({ onApply, disabled }) => {
    const [settings, setSettings] = useState({
        wordLength: { min: 4, max: 6 },
        attempts: { min: 4, max: 6 }
    });

    const handleWordLengthChange = (type, value) => {
        const numValue = parseInt(value);
        setSettings(prev => ({
            ...prev,
            wordLength: {
                ...prev.wordLength,
                [type]: numValue
            }
        }));
    };

    const handleAttemptsChange = (type, value) => {
        const numValue = parseInt(value);
        setSettings(prev => ({
            ...prev,
            attempts: {
                ...prev.attempts,
                [type]: numValue
            }
        }));
    };

    const handleApply = () => {
        // Validate settings
        if (settings.wordLength.min < 3) settings.wordLength.min = 3;
        if (settings.wordLength.max > 12) settings.wordLength.max = 12;
        if (settings.wordLength.min > settings.wordLength.max) {
            settings.wordLength.max = settings.wordLength.min;
        }
        
        if (settings.attempts.min < 3) settings.attempts.min = 3;
        if (settings.attempts.max > 15) settings.attempts.max = 15;
        if (settings.attempts.min > settings.attempts.max) {
            settings.attempts.max = settings.attempts.min;
        }
        
        onApply(settings);
    };

    return (
        <div className="custom-difficulty">
            <h4>Custom Difficulty</h4>
            
            <div className="slider-group">
                <label>Word Length:</label>
                <div className="range-inputs">
                    <div className="range-item">
                        <span>Min: {settings.wordLength.min}</span>
                        <input
                            type="range"
                            min="3"
                            max="10"
                            value={settings.wordLength.min}
                            onChange={(e) => handleWordLengthChange('min', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                    <div className="range-item">
                        <span>Max: {settings.wordLength.max}</span>
                        <input
                            type="range"
                            min="3"
                            max="12"
                            value={settings.wordLength.max}
                            onChange={(e) => handleWordLengthChange('max', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            <div className="slider-group">
                <label>Attempts:</label>
                <div className="range-inputs">
                    <div className="range-item">
                        <span>Min: {settings.attempts.min}</span>
                        <input
                            type="range"
                            min="3"
                            max="10"
                            value={settings.attempts.min}
                            onChange={(e) => handleAttemptsChange('min', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                    <div className="range-item">
                        <span>Max: {settings.attempts.max}</span>
                        <input
                            type="range"
                            min="3"
                            max="15"
                            value={settings.attempts.max}
                            onChange={(e) => handleAttemptsChange('max', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleApply}
                disabled={disabled}
                className="apply-custom-btn"
            >
                Apply Custom Settings
            </button>
        </div>
    );
};

export default CustomDifficulty;