// backend/src/aiWordGenerator.js
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

class AIWordGenerator {
    constructor() {
        if (!process.env.GITHUB_TOKEN) {
            console.error('❌ GITHUB_TOKEN not found in environment variables!');
        }

        this.openai = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: process.env.GITHUB_TOKEN,
        });
        
        // CORRECT model names for GitHub Models
        this.availableModels = [
            "Phi-3.5-mini-instruct",        // Microsoft's model - FAST, good for words
            "AI21-Jamba-1.5-Mini",           // AI21's model
            "Cohere-command-r-08-2024",      // Cohere's model
            "Mistral-small",                  // Mistral AI's model
            "Meta-Llama-3.1-8B-Instruct",     // Meta's latest - note the .1
            "gpt-4o-mini"                      // OpenAI's model (if available)
        ];
        
        // Start with the smallest/fastest model
        this.currentModelIndex = 0;
        this.modelName = this.availableModels[this.currentModelIndex];
        
        console.log(`✅ AI Word Generator initialized`);
        console.log(`📚 Available models:`, this.availableModels);
    }

    async generateWordOfLength(length) {
        // Try each model in sequence until one works
        for (let i = 0; i < this.availableModels.length; i++) {
            const model = this.availableModels[i];
            try {
                console.log(`🎲 Trying model ${i+1}/${this.availableModels.length}: ${model}`);
                
                const response = await this.openai.chat.completions.create({
                    model: model,
                    messages: [
                        { 
                            role: "system", 
                            content: "You are a word generator. Respond with ONLY a single English word, no punctuation, no explanation." 
                        },
                        { 
                            role: "user", 
                            content: `Generate a common ${length}-letter English word.` 
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 10,
                });

                let word = response.choices[0].message.content.trim().toLowerCase();
                // Clean the word - remove any punctuation or extra spaces
                word = word.replace(/[^a-z]/g, '');
                
                console.log(`🤖 Model ${model} responded with: "${word}" (length: ${word.length})`);
                
                // Validate the word
                if (word.length === length && /^[a-z]+$/.test(word)) {
                    console.log(`✅ Successfully generated word: ${word}`);
                    // Save the working model for next time
                    this.currentModelIndex = i;
                    this.modelName = model;
                    return word;
                } else {
                    console.log(`⚠️ Word length mismatch or invalid characters, trying next model...`);
                }
            } catch (error) {
                console.log(`❌ Model ${model} failed:`, error.message);
                // Continue to next model
            }
        }
        
        console.log('⚠️ All AI models failed, using fallback word');
        return this.getFallbackWord(length);
    }

    getFallbackWord(length) {
        // Make sure this returns a word of EXACTLY the requested length
        const fallbackWords = {
            4: ['time', 'book', 'hand', 'room', 'door', 'food', 'bird', 'fish', 'tree', 'moon'],
            5: ['apple', 'beach', 'chair', 'dance', 'eagle', 'flame', 'grape', 'house', 'igloo', 'jelly'],
            6: ['banana', 'breeze', 'camera', 'dragon', 'engine', 'flower', 'garden', 'hammer', 'island', 'jacket'],
            7: ['blanket', 'circuit', 'diamond', 'elephant', 'fortune', 'guitar', 'harvest', 'inkling', 'journey', 'kingdom'],
            8: ['airplane', 'backpack', 'calendar', 'dolphin', 'elephant', 'football', 'gorilla', 'happiness', 'internet', 'jellyfish']
        };
        
        const words = fallbackWords[length] || fallbackWords[5];
        return words[Math.floor(Math.random() * words.length)];
    }
}

module.exports = AIWordGenerator;