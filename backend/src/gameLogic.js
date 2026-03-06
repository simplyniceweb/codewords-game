const { v4: uuidv4 } = require('uuid');

// Word list for the game
const WORD_LIST = [
  'apple', 'beach', 'chair', 'dance', 'eagle',
  'flame', 'grape', 'house', 'igloo', 'jelly',
  'kite', 'lemon', 'money', 'night', 'ocean',
  'piano', 'queen', 'river', 'snake', 'tiger',
  'umbra', 'violet', 'whale', 'xenon', 'yacht',
  'zebra'
];

// In-memory storage for games
const games = new Map();

const MAX_ATTEMPTS = 6;

const createNewGame = () => {
  const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  const gameId = uuidv4();
  
  const game = {
    id: gameId,
    word: word,
    guessedLetters: new Set(),
    remainingAttempts: MAX_ATTEMPTS,
    status: 'IN_PROGRESS',
    createdAt: new Date()
  };
  
  games.set(gameId, game);
  return gameId;
};

const getMaskedWord = (word, guessedLetters) => {
  return word.split('').map(letter => 
    guessedLetters.has(letter) ? letter : '_'
  ).join(' ');
};

const processGuess = (gameId, guess) => {
  const game = games.get(gameId);
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  if (game.status !== 'IN_PROGRESS') {
    throw new Error('Game already ended');
  }
  
  if (!guess || typeof guess !== 'string') {
    throw new Error('Invalid guess');
  }
  
  // Convert to lowercase for case-insensitive comparison
  guess = guess.toLowerCase();
  
  // Check if it's a word guess (length > 1) or letter guess
  if (guess.length > 1) {
    // Full word guess
    if (guess === game.word) {
      game.status = 'WON';
      // Add all letters to guessedLetters to show full word
      game.word.split('').forEach(letter => game.guessedLetters.add(letter));
    } else {
      game.remainingAttempts--;
    }
  } else {
    // Single letter guess
    if (game.guessedLetters.has(guess)) {
      throw new Error('Letter already guessed');
    }
    
    game.guessedLetters.add(guess);
    
    if (!game.word.includes(guess)) {
      game.remainingAttempts--;
    }
  }
  
  // Check win condition (all letters guessed)
  const allLettersGuessed = game.word.split('').every(
    letter => game.guessedLetters.has(letter)
  );
  
  if (allLettersGuessed) {
    game.status = 'WON';
  }
  
  // Check lose condition
  if (game.remainingAttempts <= 0) {
    game.status = 'LOST';
  }
  
  return {
    id: game.id,
    maskedWord: getMaskedWord(game.word, game.guessedLetters),
    remainingAttempts: game.remainingAttempts,
    status: game.status
  };
};

const getGameState = (gameId) => {
  const game = games.get(gameId);
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  return {
    id: game.id,
    maskedWord: getMaskedWord(game.word, game.guessedLetters),
    remainingAttempts: game.remainingAttempts,
    status: game.status
  };
};

module.exports = {
  createNewGame,
  processGuess,
  getGameState,
  games // Export for debugging (optional)
};