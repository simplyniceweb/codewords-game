const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { createNewGame, processGuess, getGameState } = require('./gameLogic');


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
    console.log('Received request to create new game');
  try {
    const gameId = await createNewGame();  // Now async!
    const gameState = getGameState(gameId);
    
    // Add hint if available
    const game = require('./gameLogic').games.get(gameId);
    if (game && game.aiHint) {
      gameState.hint = game.aiHint;
    }
    
    res.status(201).json(gameState);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
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