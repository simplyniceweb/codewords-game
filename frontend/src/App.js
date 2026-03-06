import React, { useState } from 'react';
import { createNewGame, makeGuess } from './services/api';
import GameBoard from './components/GameBoard';
import GuessInput from './components/GuessInput';
import DifficultySelector from './components/DifficultySelector';
import './App.css';

function App() {
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

    const startNewGame = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Starting game with difficulty:', selectedDifficulty);
            const newGame = await createNewGame(selectedDifficulty, true);
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
                <h1>CodeWords</h1>
            </header>
            
            <main className="app-main">
                {!game ? (
                    <div className="start-screen">
                        <DifficultySelector 
                            onSelect={setSelectedDifficulty}
                            selected={selectedDifficulty}
                            disabled={loading}
                        />
                        
                        <button 
                            onClick={startNewGame} 
                            disabled={loading}
                            className="start-button"
                        >
                            {loading ? 'Starting...' : 'Start New Game'}
                        </button>
                        
                        {error && <div className="error">{error}</div>}
                    </div>
                ) : (
                    <div className="game-container">
                        <div className="game-header">
                            <button 
                                onClick={() => setGame(null)} 
                                className="new-game-button"
                                disabled={loading}
                            >
                                New Game
                            </button>
                            <span className="difficulty-badge" style={{
                                backgroundColor: 
                                    game.difficulty === 'easy' ? '#4caf50' :
                                    game.difficulty === 'medium' ? '#ff9800' :
                                    game.difficulty === 'hard' ? '#f44336' : '#9c27b0'
                            }}>
                                Difficulty: <span className='difficulty-class'>{game.difficulty}</span>
                            </span>
                        </div>
                        
                        <GameBoard 
                            maskedWord={game.maskedWord}
                            remainingAttempts={game.remainingAttempts}
                            maxAttempts={game.maxAttempts}
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
                                    onClick={() => setGame(null)} 
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