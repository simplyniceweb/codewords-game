// Dynamic difficulty settings with ranges
const DIFFICULTY_PRESETS = {
    easy: {
        name: 'Easy',
        wordLength: { min: 4, max: 5 },
        attempts: { min: 6, max: 8 },
        description: 'Short words, more attempts'
    },
    medium: {
        name: 'Medium',
        wordLength: { min: 5, max: 6 },
        attempts: { min: 5, max: 6 },
        description: 'Balanced challenge'
    },
    hard: {
        name: 'Hard',
        wordLength: { min: 6, max: 8 },
        attempts: { min: 4, max: 5 },
        description: 'Longer words, fewer attempts'
    },
    expert: {
        name: 'Expert',
        wordLength: { min: 7, max: 10 },
        attempts: { min: 3, max: 4 },
        description: 'Very challenging'
    },
    custom: {
        name: 'Custom',
        wordLength: { min: 4, max: 10 },
        attempts: { min: 3, max: 10 },
        description: 'Fully customizable'
    }
};

// Function to get random word length within range
const getRandomWordLength = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to get random attempts within range
const getRandomAttempts = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate difficulty settings for a game
const generateGameSettings = (difficulty, customSettings = null) => {
    if (difficulty === 'custom' && customSettings) {
        return {
            wordLength: getRandomWordLength(customSettings.wordLength.min, customSettings.wordLength.max),
            maxAttempts: getRandomAttempts(customSettings.attempts.min, customSettings.attempts.max),
            difficulty: 'custom',
            settings: customSettings
        };
    }
    
    const preset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medium;
    return {
        wordLength: getRandomWordLength(preset.wordLength.min, preset.wordLength.max),
        maxAttempts: getRandomAttempts(preset.attempts.min, preset.attempts.max),
        difficulty: difficulty,
        settings: preset
    };
};

// Word lists remain the same
const WORD_LISTS = {
    4: ['time', 'book', 'hand', 'room', 'door', 'food', 'bird', 'fish', 'tree', 'moon'],
    5: ['apple', 'beach', 'chair', 'dance', 'eagle', 'flame', 'grape', 'house', 'igloo', 'jelly'],
    6: ['banana', 'breeze', 'camera', 'dragon', 'engine', 'flower', 'garden', 'hammer', 'island', 'jacket'],
    7: ['blanket', 'circuit', 'diamond', 'elephant', 'fortune', 'guitar', 'harvest', 'inkling', 'journey', 'kingdom'],
    8: ['airplane', 'backpack', 'calendar', 'dolphin', 'elephant', 'football', 'gorilla', 'happiness', 'internet', 'jellyfish'],
    9: ['beautiful', 'challenge', 'dangerous', 'education', 'fireplace', 'grandmother', 'historical', 'important', 'knowledge', 'lighthouse'],
    10: ['adaptation', 'biological', 'chocolate', 'development', 'everything', 'frequently', 'government', 'horizontal', 'impossible', 'journalism']
};

const getWordByLength = (length) => {
    const list = WORD_LISTS[length] || WORD_LISTS[5];
    return list[Math.floor(Math.random() * list.length)];
};

module.exports = {
    DIFFICULTY_PRESETS,
    WORD_LISTS,
    getWordByLength,
    generateGameSettings,
    getRandomWordLength,
    getRandomAttempts
};