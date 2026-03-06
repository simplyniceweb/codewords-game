import React, { useState } from 'react';
import { createNewGame, makeGuess } from './services/api';
import GameBoard from './components/GameBoard';
import GuessInput from './components/GuessInput';
import './App.css';

function App() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startNewGame = async () => {
    setLoading(true);
    setError('');
    try {
      const newGame = await createNewGame();
      setGame(newGame);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async (guess) => {
    if (!game) return;

    setLoading(true);
    setError('');
    try {
      const updatedGame = await makeGuess(game.id, guess);
      setGame(updatedGame);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to make guess');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎮 CodeWords</h1>
      </header>
      
      <main className="app-main">
        {!game ? (
          <div className="start-screen">
            <button 
              onClick={startNewGame} 
              disabled={loading}
              className="start-button"
            >
              {loading ? 'Starting...' : 'Start New Game'}
            </button>
          </div>
        ) : (
          <div className="game-container">
            <GameBoard 
              maskedWord={game.maskedWord}
              remainingAttempts={game.remainingAttempts}
              status={game.status}
            />
            
            {game.status === 'IN_PROGRESS' ? (
              <GuessInput 
                onGuess={handleGuess} 
                disabled={loading}
              />
            ) : (
              <div className="game-over">
                <button 
                  onClick={startNewGame} 
                  disabled={loading}
                  className="new-game-button"
                >
                  Play Again
                </button>
              </div>
            )}
            
            {error && <div className="error">{error}</div>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;