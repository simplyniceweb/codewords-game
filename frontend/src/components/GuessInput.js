import React, { useState } from 'react';
import './GuessInput.css';

const GuessInput = ({ onGuess, disabled }) => {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!guess.trim()) {
      setError('Please enter a guess');
      return;
    }

    if (guess.length > 1 && !/^[a-zA-Z]+$/.test(guess)) {
      setError('Word guesses must contain only letters');
      return;
    }

    if (guess.length === 1 && !/^[a-zA-Z]$/.test(guess)) {
      setError('Please enter a single letter');
      return;
    }

    setError('');
    onGuess(guess.toLowerCase());
    setGuess('');
  };

  return (
    <div className="guess-input-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Enter a letter or word"
          disabled={disabled}
          maxLength={20}
          className="guess-input"
        />
        <button type="submit" disabled={disabled} className="guess-button">
          Guess
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default GuessInput;