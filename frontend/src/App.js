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
    const [customSettings, setCustomSettings] = useState(null);
    const [lastGuessResult, setLastGuessResult] = useState(null);

    const startNewGame = async () => {
        setLoading(true);
        setError('');
        setLastGuessResult(null);
        
        try {
            console.log('Starting game with difficulty:', selectedDifficulty);
            console.log('Custom settings:', customSettings);
            
            let newGame;
            if (selectedDifficulty === 'custom' && customSettings) {
                // Send custom settings to backend
                newGame = await createNewGame('custom', true, customSettings);
            } else {
                newGame = await createNewGame(selectedDifficulty, true);
            }
            
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
            setLastGuessResult({
                correct: updatedGame.correct,
                message: updatedGame.message
            });
            
            // Clear result message after 2 seconds
            setTimeout(() => setLastGuessResult(null), 2000);
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to make guess');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomApply = (settings) => {
        setCustomSettings(settings);
        setSelectedDifficulty('custom');
    };

    return (
        <div className="App">
            <header className="app-header">
                <h1>🎮 CodeWords</h1>
            </header>
            
            <main className="app-main">
                {!game ? (
                    <div className="start-screen">
                        <DifficultySelector 
                            onSelect={setSelectedDifficulty}
                            selected={selectedDifficulty}
                            disabled={loading}
                            onCustomApply={handleCustomApply}
                        />
                        
                        <button 
                            onClick={startNewGame} 
                            disabled={loading || (selectedDifficulty === 'custom' && !customSettings)}
                            className="start-button"
                            style={{
                                opacity: (selectedDifficulty === 'custom' && !customSettings) ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Starting...' : 'Start New Game'}
                        </button>
                        
                        {selectedDifficulty === 'custom' && !customSettings && (
                            <div className="info-message">
                                ⚡ Please set custom difficulty first
                            </div>
                        )}
                        
                        {error && <div className="error">{error}</div>}
                    </div>
                ) : (
                    <div className="game-container">
                        <div className="game-header">
                            <div className="game-info">
                                <span className="difficulty-badge" style={{
                                    backgroundColor: 
                                        game.difficulty === 'easy' ? '#4caf50' :
                                        game.difficulty === 'medium' ? '#ff9800' :
                                        game.difficulty === 'hard' ? '#f44336' :
                                        game.difficulty === 'expert' ? '#9c27b0' : '#2196F3'
                                }}>
                                    {game.difficulty === 'custom' ? 'Custom' : game.difficulty}
                                </span>
                                <span className="word-length">
                                    📏 {game.wordLength} letters
                                </span>
                            </div>
                            <button 
                                onClick={() => {
                                    setGame(null);
                                    setLastGuessResult(null);
                                }} 
                                className="new-game-btn"
                                disabled={loading}
                            >
                                New Game
                            </button>
                        </div>
                        
                        {lastGuessResult && (
                            <div className={`guess-result ${lastGuessResult.correct ? 'correct' : 'wrong'}`}>
                                {lastGuessResult.message}
                            </div>
                        )}
                        
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
                        ) : game.status !== 'IN_PROGRESS' && (
                                <div className="game-over">
                                    <h2>{game.status === 'WON' ? '🎉 Victory!' : '😢 Game Over'}</h2>
                                    <div className="word-reveal">
                                        <p>The word was:</p>
                                        <div className="final-word">
                                            {game.word.split('').map((letter, index) => (
                                                <span key={index} className="final-letter">
                                                    {letter.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {game.status === 'LOST' && (
                                        <p className="try-again-message">Better luck next time! 🍀</p>
                                    )}
                                    
                                    <button 
                                        onClick={() => {
                                            setGame(null);
                                            setLastGuessResult(null);
                                        }} 
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