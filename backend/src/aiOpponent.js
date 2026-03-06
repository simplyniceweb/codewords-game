const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

class AIOpponent {
    constructor() {
        // Initialize OpenAI client for AI opponent
        this.openai = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: process.env.GITHUB_TOKEN,
        });
        
        // Use models that are actually available on GitHub Models
        this.availableModels = [
            "AI21-Jamba-1.5-Mini",     // AI21's model - good for word games
            "Mistral-small",            // Mistral's model
            "Phi-3-mini-4k-instruct",   // Microsoft's Phi-3 model
            "Cohere-command-r-08-2024", // Cohere's model
            "Meta-Llama-3.1-8B-Instruct" // Meta's Llama model
        ];
        
        this.currentModelIndex = 0;
        this.modelName = this.availableModels[0];
        
        this.commonLetters = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd', 'l', 'c', 'u', 'm', 'w', 'f', 'g', 'y', 'p', 'b', 'v', 'k', 'j', 'x', 'q', 'z'];
        
        console.log('🤖 AI Opponent initialized with models:', this.availableModels);
    }

    async makeGuess(gameState) {
        const { wordLength, guessedLetters, maskedWord, remainingAttempts } = gameState;
        
        console.log('🤔 AI is thinking...');
        console.log('Current state:', {
            wordLength,
            guessedLetters: guessedLetters || [],
            maskedWord,
            remainingAttempts
        });

        // Try AI-powered guess first with fallback models
        const aiGuess = await this.getAIGuess(gameState);
        if (aiGuess) {
            console.log(`🤖 AI suggests: "${aiGuess}"`);
            return aiGuess;
        }

        // Fallback to strategic guessing
        return this.getStrategicGuess(gameState);
    }

    async getAIGuess(gameState) {
        const { wordLength, guessedLetters = [], maskedWord, remainingAttempts } = gameState;
        
        // Create a Set for faster lookup
        const guessedSet = new Set(guessedLetters);
        
        // If all letters are guessed, try to guess the word
        if (guessedSet.size >= 26) {
            const possibleWord = maskedWord.replace(/ /g, '');
            if (!possibleWord.includes('_')) {
                return possibleWord;
            }
        }

        // Try each model in sequence
        for (const model of this.availableModels) {
            try {
                console.log(`Trying model: ${model}`);
                
                // Add instruction to avoid repeated guesses
                const prompt = `You are playing a word guessing game. The word has ${wordLength} letters.
    Current progress: ${maskedWord}
    Letters ALREADY GUESSED (DO NOT GUESS THESE AGAIN): ${guessedLetters.join(', ') || 'none'}
    Attempts remaining: ${remainingAttempts}

    IMPORTANT: You MUST NOT guess any letter that's already in the guessed list.
    Based on the pattern, what's the best next guess? 
    - If you know the word, guess the full word
    - Otherwise, guess a single letter NOT in the guessed list
    Return ONLY your guess (a single letter or word), nothing else.`;

                const response = await this.openai.chat.completions.create({
                    model: model,
                    messages: [
                        { 
                            role: "system", 
                            content: "You are a word game champion. Never guess the same letter twice." 
                        },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.2, // Lower temperature for more consistent results
                    max_tokens: 15,
                });

                let guess = response.choices[0].message.content.trim().toLowerCase();
                guess = guess.replace(/[^a-z]/g, '');
                
                // Validate guess - check if it's a new letter or possible word
                if (guess.length === 1) {
                    // Single letter - must not be guessed before
                    if (!guessedSet.has(guess)) {
                        console.log(`✅ Model ${model} suggested new letter: "${guess}"`);
                        this.currentModelIndex = this.availableModels.indexOf(model);
                        this.modelName = model;
                        return guess;
                    } else {
                        console.log(`⚠️ Model suggested already guessed letter "${guess}", trying next model...`);
                    }
                } else if (guess.length === wordLength) {
                    // Word guess - always allowed
                    console.log(`✅ Model ${model} suggested word: "${guess}"`);
                    return guess;
                }
            } catch (error) {
                console.log(`❌ Model ${model} failed:`, error.message);
            }
        }
        
        return null;
    }

    getStrategicGuess(gameState) {
        const { wordLength, guessedLetters = [], maskedWord } = gameState;
        
        const guessedSet = new Set(guessedLetters);
        
        console.log('Using strategic guessing with guessed letters:', Array.from(guessedSet));
        
        // First, try common letters that haven't been guessed
        for (const letter of this.commonLetters) {
            if (!guessedSet.has(letter)) {
                console.log(`📊 Strategic guess: "${letter}" (common unguessed letter)`);
                return letter;
            }
        }

        // If all common letters are guessed, try any unguessed letter in order
        for (let i = 97; i <= 122; i++) {
            const letter = String.fromCharCode(i);
            if (!guessedSet.has(letter)) {
                console.log(`📊 Strategic guess: "${letter}" (last unguested letter)`);
                return letter;
            }
        }

        // If all letters are guessed, try to guess the word
        if (maskedWord && !maskedWord.includes('_')) {
            const possibleWord = maskedWord.replace(/ /g, '');
            console.log(`📊 Guessing word: "${possibleWord}"`);
            return possibleWord;
        }

        // This should never happen, but just in case
        return null;
    }

    async analyzePattern(maskedWord, guessedLetters) {
        if (!maskedWord) return [];
        
        const pattern = maskedWord.replace(/ /g, '');
        const missingPositions = [];
        
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] === '_') {
                missingPositions.push(i);
            }
        }
        
        return missingPositions;
    }
}

module.exports = AIOpponent;