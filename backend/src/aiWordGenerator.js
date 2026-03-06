const OpenAI = require('openai');

class AIWordGenerator {
    constructor() {
        if (!process.env.GITHUB_TOKEN) {
            console.error('❌ GITHUB_TOKEN not found in environment variables!');
        }

        this.openai = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: process.env.GITHUB_TOKEN,
        });
        
        this.modelName = "Phi-3.5-mini-instruct";
        console.log('✅ AI Word Generator initialized with GitHub Models');
    }

    async generateWord() {
        return this.generateWordOfLength(5); // Default to 5 letters
    }

    async generateWordOfLength(length) {
        try {
            console.log(`🎲 Generating ${length}-letter word with AI...`);
            
            const response = await this.openai.chat.completions.create({
                model: this.modelName,
                messages: [
                    { 
                        role: "system", 
                        content: `You are a word generator for a word guessing game. Generate common, everyday English words that are exactly ${length} letters long.` 
                    },
                    { 
                        role: "user", 
                        content: `Generate a random ${length}-letter English word. Return ONLY the word, nothing else - no punctuation, no explanation, no quotes.` 
                    }
                ],
                temperature: 0.8,
                max_tokens: 10,
            });

            let word = response.choices[0].message.content.trim().toLowerCase();
            word = word.replace(/[^a-z]/g, '');
            
            if (word.length === length) {
                console.log(`✅ AI generated word: ${word}`);
                return word;
            } else {
                console.log(`⚠️ AI word wrong length (got ${word.length}, needed ${length}), using fallback`);
                return this.getFallbackWord(length);
            }
        } catch (error) {
            console.error('❌ AI generation failed:', error.message);
            return this.getFallbackWord(length);
        }
    }

    getFallbackWord(length) {
        // Import here to avoid circular dependency
        const { getWordByLength } = require('./difficulty');
        return getWordByLength(length);
    }
}

module.exports = AIWordGenerator;