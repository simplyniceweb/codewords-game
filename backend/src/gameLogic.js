const { v4: uuidv4 } = require('uuid');
const AIWordGenerator = require('./aiWordGenerator');
const { DIFFICULTY_SETTINGS, getWordByLength } = require('./difficulty');

let aiGenerator;
try {
    aiGenerator = new AIWordGenerator();
    console.log('✅ AI Generator initialized');
} catch (error) {
    console.error('❌ Failed to initialize AI generator:', error.message);
}

const games = new Map();

const createNewGame = async (difficulty = 'medium', useAI = true) => {
    console.log(`🎮 Creating new game with difficulty: ${difficulty}`);
    
    // Get settings for selected difficulty
    const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;
    
    let word;
    const targetLength = Math.floor(
        Math.random() * (settings.wordLength.max - settings.wordLength.min + 1) + settings.wordLength.min
    );
    
    console.log(`📏 Target word length: ${targetLength} letters`);
    
    if (useAI && aiGenerator) {
        try {
            // Ask AI for a word of specific length
            word = await aiGenerator.generateWordOfLength(targetLength);
        } catch (error) {
            console.error('AI generation failed, using fallback:', error.message);
            word = getWordByLength(targetLength);
        }
    } else {
        word = getWordByLength(targetLength);
    }
    
    const gameId = uuidv4();
    console.log('📝 New game ID:', gameId, 'Word:', word);
    
    const game = {
        id: gameId,
        word: word,
        guessedLetters: new Set(),
        remainingAttempts: settings.maxAttempts,
        maxAttempts: settings.maxAttempts,
        difficulty: difficulty,
        status: 'IN_PROGRESS',
        createdAt: new Date()
    };
    
    games.set(gameId, game);
    console.log('📊 Total games:', games.size);
    
    return gameId;
};

// Update getMaskedWord to handle spaces properly
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
    
    guess = guess.toLowerCase();
    
    // Check if it's a word guess (length > 1) or letter guess
    if (guess.length > 1) {
        // Full word guess
        if (guess === game.word) {
            game.status = 'WON';
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
    
    // Check win condition
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
        maxAttempts: game.maxAttempts,
        difficulty: game.difficulty,
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
        maxAttempts: game.maxAttempts,
        difficulty: game.difficulty,
        status: game.status
    };
};

module.exports = {
    createNewGame,
    processGuess,
    getGameState,
    games,
    DIFFICULTY_SETTINGS  // Export for frontend to use
};