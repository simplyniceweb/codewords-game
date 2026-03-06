const { v4: uuidv4 } = require('uuid');
const AIWordGenerator = require('./aiWordGenerator');
const { generateGameSettings, getWordByLength, DIFFICULTY_PRESETS } = require('./difficulty');

let aiGenerator;
try {
    aiGenerator = new AIWordGenerator();
    console.log('✅ AI Generator initialized');
} catch (error) {
    console.error('❌ Failed to initialize AI generator:', error.message);
}

const games = new Map();

const createNewGame = async (difficulty = 'medium', useAI = true, customSettings = null) => {
    console.log(`🎮 Creating new game with difficulty: ${difficulty}`);
    
    // Generate dynamic settings
    const settings = generateGameSettings(difficulty, customSettings);
    
    console.log(`📏 Settings:`, {
        wordLength: settings.wordLength,
        maxAttempts: settings.maxAttempts,
        difficulty: settings.difficulty
    });
    
    let word;
    if (useAI && aiGenerator) {
        try {
            word = await aiGenerator.generateWordOfLength(settings.wordLength);
        } catch (error) {
            console.error('AI generation failed, using fallback:', error.message);
            word = getWordByLength(settings.wordLength);
        }
    } else {
        word = getWordByLength(settings.wordLength);
    }
    
    const gameId = uuidv4();
    console.log('📝 New game ID:', gameId, 'Word:', word, `(${word.length} letters)`);
    
    const game = {
        id: gameId,
        word: word,
        guessedLetters: new Set(),
        remainingAttempts: settings.maxAttempts,
        maxAttempts: settings.maxAttempts,
        difficulty: difficulty,
        wordLength: word.length,
        difficultySettings: settings,
        status: 'IN_PROGRESS',
        createdAt: new Date()
    };
    
    games.set(gameId, game);
    console.log('📊 Total games:', games.size);
    
    return gameId;
};

// Update processGuess to handle dynamic attempts
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
    console.log(`🎯 Processing guess: "${guess}" for game ${gameId}`);
    console.log(`📊 Current game state:`, {
        word: game.word,
        guessedLetters: Array.from(game.guessedLetters),
        remainingAttempts: game.remainingAttempts
    });
    
    let correct = false;
    let message = '';
    
    if (guess.length > 1) {
        // Full word guess
        if (guess === game.word) {
            console.log(`🎉 Correct full word guess!`);
            game.status = 'WON';
            // Add ALL letters to guessedLetters
            game.word.split('').forEach(letter => game.guessedLetters.add(letter));
            correct = true;
            message = '🎉 Correct! You won!';
        } else {
            console.log(`❌ Wrong full word guess`);
            game.remainingAttempts--;
            correct = false;
            message = `❌ "${guess}" is not the word`;
        }
    } else {
        // Single letter guess
        if (game.guessedLetters.has(guess)) {
            throw new Error('Letter already guessed');
        }
        
        game.guessedLetters.add(guess);
        
        if (game.word.includes(guess)) {
            console.log(`✅ Correct letter guess: "${guess}"`);
            correct = true;
            message = `✅ Good guess! "${guess}" is in the word!`;
        } else {
            console.log(`❌ Wrong letter guess: "${guess}"`);
            game.remainingAttempts--;
            correct = false;
            message = `❌ "${guess}" is not in the word`;
        }
    }
    
    // Check win condition (all letters guessed)
    const allLettersGuessed = game.word.split('').every(
        letter => game.guessedLetters.has(letter)
    );
    
    if (allLettersGuessed) {
        game.status = 'WON';
        console.log(`🏆 Game won by revealing all letters!`);
    }
    
    // Check lose condition
    if (game.remainingAttempts <= 0) {
        game.status = 'LOST';
        console.log(`💀 Game lost - out of attempts`);
    }
    
    const maskedWord = getMaskedWord(game.word, game.guessedLetters);
    console.log(`📤 Returning game state:`, {
        maskedWord,
        remainingAttempts: game.remainingAttempts,
        status: game.status
    });
    
    return {
        id: game.id,
        word: game.word,
        maskedWord: maskedWord,
        remainingAttempts: game.remainingAttempts,
        maxAttempts: game.maxAttempts,
        difficulty: game.difficulty,
        wordLength: game.word.length,
        status: game.status,
        correct: correct,
        message: message
    };
};

const getMaskedWord = (word, guessedLetters) => {
    // Convert Set to array for easier debugging
    const guessed = Array.from(guessedLetters);
    console.log(`🔍 Masking word: "${word}" with guessed letters:`, guessed);
    
    // Create masked version with spaces between letters
    const masked = word.split('').map(letter => {
        const shouldReveal = guessedLetters.has(letter);
        console.log(`   Letter "${letter}" - guessed: ${shouldReveal ? 'yes' : 'no'}`);
        return shouldReveal ? letter : '_';
    }).join(' ');
    
    console.log(`📝 Result: "${masked}"`);
    return masked;
};

const getGameState = (gameId) => {
    const game = games.get(gameId);
    
    if (!game) {
        throw new Error('Game not found');
    }
    
    return {
        id: game.id,
        word: game.word,
        maskedWord: getMaskedWord(game.word, game.guessedLetters),
        remainingAttempts: game.remainingAttempts,
        maxAttempts: game.maxAttempts,
        difficulty: game.difficulty,
        wordLength: game.word.length,
        status: game.status
    };
};

module.exports = {
    createNewGame,
    processGuess,
    getGameState,
    games,
    DIFFICULTY_PRESETS
};