const OpenAI = require('openai');

class AIWordGenerator {
  constructor() {
    if (!process.env.GITHUB_TOKEN) {
      console.error('❌ GITHUB_TOKEN not found in environment variables!');
      console.error('Please add it to backend/.env file');
    }

    // Initialize with GitHub Models endpoint
    this.openai = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",  // GitHub Models endpoint [citation:2]
      apiKey: process.env.GITHUB_TOKEN,  // Your GitHub token
    });
    
    // Use a small, fast model for word generation
    this.modelName = "Phi-3.5-mini-instruct";  // Microsoft's small, efficient model [citation:2]
    console.log('✅ AI Word Generator initialized with GitHub Models');
  }

  async generateWord() {
    try {
      console.log('🎲 Generating word with AI...');
      
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { 
            role: "system", 
            content: "You are a word generator for a word guessing game. Generate common, everyday English words." 
          },
          { 
            role: "user", 
            content: "Generate a random 5-letter English word. Return ONLY the word, nothing else - no punctuation, no explanation, no quotes." 
          }
        ],
        temperature: 0.8,  // Slight randomness for variety
        max_tokens: 10,     // We only need a single word
      });

      // Extract and clean the word
      let word = response.choices[0].message.content.trim().toLowerCase();
      word = word.replace(/[^a-z]/g, '');  // Remove any punctuation
      
      // Validate it's a reasonable length for the game
      if (word.length >= 3 && word.length <= 8) {
        console.log(`✅ AI generated word: ${word}`);
        return word;
      } else {
        console.log(`⚠️ AI word invalid length (${word.length}), using fallback`);
        return this.getFallbackWord();
      }
    } catch (error) {
      console.error('❌ AI generation failed:', error.message);
      return this.getFallbackWord();
    }
  }

  getFallbackWord() {
    // Your original word list as backup
    const words = ['apple', 'beach', 'chair', 'dance', 'eagle', 
                   'flame', 'grape', 'house', 'igloo', 'jelly'];
    return words[Math.floor(Math.random() * words.length)];
  }

  // Bonus: Get an AI hint for the player
  async generateHint(word, guessedLetters) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: "You are a helpful word game assistant. Give subtle hints without revealing the word."
          },
          {
            role: "user",
            content: `The secret word is "${word}". 
                     Guessed letters: ${Array.from(guessedLetters).join(', ') || 'none'}
                     Give ONE subtle hint about this word. Keep it short and playful.`
          }
        ],
        temperature: 0.7,
        max_tokens: 50,
      });

      return response.choices[0].message.content;
    } catch (error) {
      return null;
    }
  }
}

module.exports = AIWordGenerator;