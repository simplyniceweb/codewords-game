const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { createNewGame, processGuess, getGameState, DIFFICULTY_SETTINGS, DIFFICULTY_PRESETS } = require('./gameLogic');
const AIOpponent = require('./aiOpponent');
const { v4: uuidv4 } = require('uuid');

// Initialize AI Opponent
const aiOpponent = new AIOpponent();

// Store AI games separately (or reuse games map)
const aiGames = new Map();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend to connect
  credentials: true
}));
app.use(express.json());

// Routes
app.post('/game', async (req, res) => {
    console.log('📝 Received request to create new game');
    console.log('Request body:', req.body);
    
    try {
        const { difficulty = 'medium', useAI = true, customSettings = null } = req.body;
        
        console.log(`🎯 Requested difficulty: ${difficulty}`);
        if (customSettings) {
            console.log('⚙️ Custom settings:', customSettings);
        }
        
        // Validate difficulty
        if (!DIFFICULTY_PRESETS[difficulty] && difficulty !== 'custom') {
            return res.status(400).json({ 
                error: 'Invalid difficulty level. Choose: easy, medium, hard, expert, custom' 
            });
        }
        
        // For custom difficulty, require customSettings
        if (difficulty === 'custom' && !customSettings) {
            return res.status(400).json({ 
                error: 'Custom settings required for custom difficulty' 
            });
        }
        
        const gameId = await createNewGame(difficulty, useAI, customSettings);
        const gameState = getGameState(gameId);
        
        res.status(201).json(gameState);
    } catch (error) {
        console.error('❌ Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game: ' + error.message });
    }
});

app.post('/game/ai-opponent', async (req, res) => {
    try {
        const { word, difficulty = 'medium' } = req.body;
        
        if (!word || word.length < 3 || word.length > 10) {
            return res.status(400).json({ 
                error: 'Please provide a word between 3-10 letters' 
            });
        }

        const gameId = uuidv4();
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        
        const game = {
            id: gameId,
            word: cleanWord,
            guessedLetters: [], // This is an array, not a Set!
            remainingAttempts: 12,
            maxAttempts: 12,
            difficulty: difficulty,
            status: 'IN_PROGRESS',
            createdAt: new Date(),
            aiGuesses: [],
            lastAIGuess: null
        };
        
        aiGames.set(gameId, game);
        
        console.log(`🤖 AI Opponent game started: ${gameId} with word "${cleanWord}"`);
        
        // Create initial masked word
        const maskedWord = '_ '.repeat(cleanWord.length).trim();
        
        // Make first AI guess automatically
        const aiOpponentInstance = new AIOpponent(); // Renamed to avoid conflict
        const gameState = {
            wordLength: cleanWord.length,
            guessedLetters: [], // Pass as array
            maskedWord: maskedWord,
            remainingAttempts: 12
        };
        
        const firstGuess = await aiOpponentInstance.makeGuess(gameState);
        
        // Process the first guess
        if (firstGuess) {
            game.guessedLetters.push(firstGuess);
            game.lastAIGuess = firstGuess;
            game.aiGuesses.push({
                guess: firstGuess,
                correct: cleanWord.includes(firstGuess),
                timestamp: new Date()
            });
            
            if (!cleanWord.includes(firstGuess)) {
                game.remainingAttempts--;
            }
        }
        
        // Update masked word after first guess
        const updatedMaskedWord = getAIMaskedWord(cleanWord, game.guessedLetters);
        
        res.status(201).json({
            id: game.id,
            word: cleanWord,
            maskedWord: updatedMaskedWord,
            wordLength: cleanWord.length,
            guessedLetters: game.guessedLetters,
            remainingAttempts: game.remainingAttempts,
            maxAttempts: game.maxAttempts,
            difficulty: game.difficulty,
            status: game.status,
            message: firstGuess ? `AI starts with "${firstGuess}"!` : 'AI is thinking...',
            aiGuess: firstGuess,
            correct: firstGuess ? cleanWord.includes(firstGuess) : false
        });
    } catch (error) {
        console.error('Error creating AI game:', error);
        res.status(500).json({ error: 'Failed to create AI game: ' + error.message });
    }
});

// Make AI guess - FIXED
app.post('/game/ai-opponent/:gameId/guess', async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = aiGames.get(gameId);
        
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        if (game.status !== 'IN_PROGRESS') {
            return res.status(400).json({ error: 'Game already ended' });
        }

        // Prepare game state for AI - pass guessedLetters as array
        const gameState = {
            wordLength: game.word.length,
            guessedLetters: game.guessedLetters, // This is already an array
            maskedWord: getAIMaskedWord(game.word, game.guessedLetters),
            remainingAttempts: game.remainingAttempts
        };

        // Get AI's guess
        const aiOpponentInstance = new AIOpponent();
        const aiGuess = await aiOpponentInstance.makeGuess(gameState);
        
        // Process the guess
        let correct = false;
        let message = '';

        if (aiGuess.length > 1) {
            // Word guess
            if (aiGuess === game.word) {
                game.status = 'WON';
                correct = true;
                message = `🎉 AI won! It guessed "${aiGuess}" correctly!`;
                // Add all letters to guessedLetters
                game.word.split('').forEach(letter => {
                    if (!game.guessedLetters.includes(letter)) {
                        game.guessedLetters.push(letter);
                    }
                });
            } else {
                game.remainingAttempts--;
                message = `❌ AI guessed "${aiGuess}" - wrong word`;
            }
        } else {
            // Letter guess
            if (game.guessedLetters.includes(aiGuess)) {
                // AI shouldn't guess same letter twice, but just in case
                // game.remainingAttempts--;
                message = `⚠️ AI guessed "${aiGuess}" again (no wasted turn)`;
            } else {
                game.guessedLetters.push(aiGuess);
                if (game.word.includes(aiGuess)) {
                    correct = true;
                    message = `✅ AI found letter "${aiGuess}"!`;
                } else {
                    game.remainingAttempts--;
                    message = `❌ AI guessed "${aiGuess}" - not in word`;
                }
            }
        }

        // Track AI's guess
        game.aiGuesses.push({
            guess: aiGuess,
            correct: correct,
            timestamp: new Date()
        });
        game.lastAIGuess = aiGuess;

        // Check win condition
        const allLettersGuessed = game.word.split('').every(
            letter => game.guessedLetters.includes(letter)
        );
        
        if (allLettersGuessed) {
            game.status = 'WON';
            message = `🎉 AI won by finding all letters! The word was "${game.word}"`;
        }

        // Check lose condition
        if (game.remainingAttempts <= 0) {
            game.status = 'LOST';
            message = `😢 AI lost! Your word "${game.word}" remains unguessed. You win!`;
        }

        const maskedWord = getAIMaskedWord(game.word, game.guessedLetters);

        res.json({
            id: game.id,
            aiGuess: aiGuess,
            maskedWord: maskedWord,
            guessedLetters: game.guessedLetters,
            remainingAttempts: game.remainingAttempts,
            maxAttempts: game.maxAttempts,
            status: game.status,
            correct: correct,
            message: message,
            gameOver: game.status !== 'IN_PROGRESS',
            word: game.status !== 'IN_PROGRESS' ? game.word : undefined
        });

    } catch (error) {
        console.error('AI guess error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get AI game state
app.get('/game/ai-opponent/:gameId', (req, res) => {
    try {
        const { gameId } = req.params;
        const game = aiGames.get(gameId);
        
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({
            id: game.id,
            maskedWord: getAIMaskedWord(game.word, game.guessedLetters),
            guessedLetters: Array.from(game.guessedLetters),
            remainingAttempts: game.remainingAttempts,
            maxAttempts: game.maxAttempts,
            status: game.status,
            aiGuesses: game.aiGuesses.slice(-5), // Last 5 guesses
            lastAIGuess: game.lastAIGuess
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add endpoint to get difficulty settings
app.get('/difficulties', (req, res) => {
    res.json(DIFFICULTY_SETTINGS);
});

app.get('/game/:gameId/hint', (req, res) => {
  try {
    const { gameId } = req.params;
    const game = require('./gameLogic').games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ hint: game.aiHint || 'No hint available yet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/game/:gameId/guess', (req, res) => {
  try {
    const { gameId } = req.params;
    const { guess } = req.body;
    
    if (!guess) {
      return res.status(400).json({ error: 'Guess is required' });
    }
    
    const gameState = processGuess(gameId, guess);
    res.json(gameState);
  } catch (error) {
    if (error.message === 'Game not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Game already ended') {
      res.status(400).json({ error: error.message });
    } else if (error.message === 'Invalid guess' || error.message === 'Letter already guessed') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/game/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const gameState = getGameState(gameId);
    res.json(gameState);
  } catch (error) {
    if (error.message === 'Game not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

function getAIMaskedWord(word, guessedLetters) {
    // Convert guessedLetters to Set if it's an array
    const guessedSet = Array.isArray(guessedLetters) ? new Set(guessedLetters) : guessedLetters;
    
    return word.split('').map(letter => 
        guessedSet.has(letter) ? letter : '_'
    ).join(' ');
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});