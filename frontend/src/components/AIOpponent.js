import React, { useState, useEffect, useCallback } from 'react';
import { startAIGame, makeAIGuess } from '../services/api';
import './AIOpponent.css';

const AIOpponent = ({ onBack }) => {
    const [game, setGame] = useState(null);
    const [word, setWord] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [autoPlay, setAutoPlay] = useState(true);
    const [guessHistory, setGuessHistory] = useState([]);

    const handleStartGame = async () => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (!cleanWord || cleanWord.length < 3 || cleanWord.length > 10) {
            setError('Please enter a word between 3-10 letters');
            return;
        }

        setLoading(true);
        setError('');
        try {
            console.log('Starting AI game with word:', cleanWord);
            const newGame = await startAIGame(cleanWord, 'medium');
            console.log('AI Game started:', newGame);
            
            setGame({
                ...newGame,
                guessedLetters: newGame.guessedLetters || [],
                maskedWord: newGame.maskedWord || '_ '.repeat(newGame.wordLength).trim(),
                remainingAttempts: newGame.remainingAttempts || newGame.maxAttempts
            });
            
            setGuessHistory([]);
            
            // Automatically make first AI guess after game starts
            setTimeout(() => {
                handleAITurn(newGame.id);
            }, 1000);
            
        } catch (err) {
            console.error('Failed to start game:', err);
            setError(typeof err === 'string' ? err : 'Failed to start game');
        } finally {
            setLoading(false);
        }
    };

    // Memoize handleAITurn with useCallback
    const handleAITurn = useCallback(async (gameId = null) => {
        const currentGameId = gameId || game?.id;
        if (!currentGameId) return;
        
        if (game && game.status !== 'IN_PROGRESS') return;

        setLoading(true);
        try {
            console.log('Taking AI turn for game:', currentGameId);
            const result = await makeAIGuess(currentGameId);
            console.log('AI turn result:', result);
            
            setGame(result);
            
            if (result.aiGuess) {
                setGuessHistory(prev => [{
                    guess: result.aiGuess,
                    correct: result.correct || false,
                    message: result.message || '',
                    timestamp: new Date().toLocaleTimeString()
                }, ...prev].slice(0, 10));
            }

            if (autoPlay && result.status === 'IN_PROGRESS') {
                setTimeout(() => handleAITurn(currentGameId), 1500);
            }
        } catch (err) {
            console.error('AI guess failed:', err);
            setError(typeof err === 'string' ? err : 'AI guess failed');
        } finally {
            setLoading(false);
        }
    }, [game, autoPlay]); // Dependencies for useCallback

    // Auto-start first turn if needed
    useEffect(() => {
        let timer;
        if (game && game.status === 'IN_PROGRESS' && autoPlay && guessHistory.length === 0) {
            timer = setTimeout(() => {
                handleAITurn(game.id);
            }, 1000);
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [game, autoPlay, guessHistory.length, handleAITurn]); // Now all dependencies are included

    const toggleAutoPlay = () => {
        setAutoPlay(!autoPlay);
        if (!autoPlay && game?.status === 'IN_PROGRESS') {
            setTimeout(() => handleAITurn(), 500);
        }
    };

    return (
        <div className="ai-opponent-container">
            <button onClick={onBack} className="back-button">
                ← Back to Menu
            </button>

            <h2>🤖 AI Opponent Mode</h2>
            <p className="ai-description">
                Choose a word and watch the AI try to guess it!
            </p>

            {!game ? (
                <div className="word-selection">
                    <div className="input-group">
                        <label>Enter your secret word (3-10 letters):</label>
                        <input
                            type="text"
                            value={word}
                            onChange={(e) => setWord(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                            placeholder="e.g., puzzle"
                            maxLength={10}
                            disabled={loading}
                            className="word-input"
                        />
                        <p className="word-hint">
                            The AI will try to guess this word!
                        </p>
                    </div>

                    <button 
                        onClick={handleStartGame}
                        disabled={loading || !word}
                        className="start-ai-button"
                    >
                        {loading ? 'Starting...' : 'Start AI Game'}
                    </button>
                </div>
            ) : (
                <div className="ai-game-area">
                    <div className="ai-game-header">
                        <div className="ai-status">
                            <span className="status-badge">Word length: {game.wordLength || game.word?.length}</span>
                            <span className="status-badge attempts">
                                Attempts: {game.remainingAttempts}/{game.maxAttempts}
                            </span>
                        </div>
                        <div className="ai-controls">
                            <label className="auto-play-toggle">
                                <input
                                    type="checkbox"
                                    checked={autoPlay}
                                    onChange={toggleAutoPlay}
                                    disabled={game.status !== 'IN_PROGRESS'}
                                />
                                Auto-play
                            </label>
                            <button
                                onClick={() => handleAITurn()}
                                disabled={loading || game.status !== 'IN_PROGRESS'}
                                className="ai-turn-button"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Thinking...
                                    </>
                                ) : (
                                    'AI Turn'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="ai-game-board">
                        <div className="word-progress">
                            {game.maskedWord && game.maskedWord.split(' ').map((char, index) => (
                                <span key={index} className="ai-letter-tile">
                                    {char || '_'}
                                </span>
                            ))}
                        </div>

                        <div className="guessed-letters">
                            <h4>Guessed Letters:</h4>
                            <div className="letters-grid">
                                {(game.guessedLetters || []).length > 0 ? (
                                    (game.guessedLetters || []).map((letter, index) => (
                                        <span key={index} className="guessed-letter">
                                            {letter}
                                        </span>
                                    ))
                                ) : (
                                    <p className="no-guesses">No letters guessed yet</p>
                                )}
                            </div>
                        </div>

                        {game.message && (
                            <div className={`ai-message ${game.correct ? 'correct' : 'wrong'}`}>
                                {game.message}
                            </div>
                        )}

                        {guessHistory.length > 0 && (
                            <div className="guess-history">
                                <h4>Recent AI Guesses:</h4>
                                <div className="history-list">
                                    {guessHistory.map((item, index) => (
                                        <div key={index} className={`history-item ${item.correct ? 'correct-guess' : 'wrong-guess'}`}>
                                            <span className="guess-time">{item.timestamp}</span>
                                            <span className="guess-value">"{item.guess}"</span>
                                            <span className="guess-message">{item.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {game.gameOver && (
                            <div className={`ai-game-over ${game.status === 'WON' ? 'ai-lost' : 'ai-won'}`}>
                                <h3>{game.status === 'WON' ? '🤖 AI Wins!' : '🎉 You Win!'}</h3>
                                <p className="final-word-reveal">
                                    Your word was: <strong>{game.word || game.revealedWord}</strong>
                                </p>
                                <button
                                    onClick={() => {
                                        setGame(null);
                                        setWord('');
                                        setGuessHistory([]);
                                    }}
                                    className="play-again-button"
                                >
                                    Play Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default AIOpponent;