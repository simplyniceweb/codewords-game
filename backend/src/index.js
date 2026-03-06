const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { createNewGame, processGuess, getGameState, DIFFICULTY_SETTINGS, DIFFICULTY_PRESETS } = require('./gameLogic');


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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});