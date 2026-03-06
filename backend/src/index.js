const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createNewGame, processGuess, getGameState } = require('./gameLogic');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend to connect
  credentials: true
}));
app.use(express.json());

// Routes
app.post('/game', (req, res) => {
  try {
    const gameId = createNewGame();
    const gameState = getGameState(gameId);
    res.status(201).json(gameState);
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