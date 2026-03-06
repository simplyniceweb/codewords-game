🎮 CodeWords - AI-Powered Word Guessing Game

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![License](https://img.shields.io/badge/license-MIT-purple)

A full-stack word-guessing game that combines the best elements of Hangman and Wordle, featuring AI-powered word generation and an intelligent AI opponent mode. Built with React, Node.js, and GitHub Models API.

📋 Table of Contents
Features

Tech Stack

Game Rules

Project Structure

Installation

Running the Game

Game Modes

API Documentation

AI Integration

Screenshots

Contributing

License

✨ Features
Core Game Features
🎯 Classic Word Guessing - Guess letters or the full word

📊 Dynamic Difficulty - 4 difficulty levels with adjustable word length and attempts

🎨 Modern UI - Beautiful gradient designs with smooth animations

📱 Responsive Design - Plays great on desktop and mobile

AI-Powered Features
🤖 AI Word Generation - Dynamically generates unique words using GitHub Models

🧠 Smart AI Opponent - Watch AI try to guess YOUR words with strategic thinking

💡 Intelligent Hints - Get contextual hints when stuck

🔄 Auto-Play Mode - Let the AI play itself!

Difficulty Levels
Level	Word Length	Attempts	Description
Easy	4-5 letters	6-8	Perfect for beginners
Medium	5-6 letters	5-6	Balanced challenge
Hard	6-8 letters	4-5	For experienced players
Expert	7-10 letters	3-4	Ultimate test
Custom	3-12 letters	3-15	Fully customizable
🛠 Tech Stack
Backend
Node.js - Runtime environment

Express - Web framework

GitHub Models API - AI integration

UUID - Game ID generation

CORS - Cross-origin resource sharing

Frontend
React - UI library

Axios - HTTP client

CSS3 - Styling with animations

Create React App - Build tooling

📖 Game Rules
Starting a Game

Select difficulty level

Game randomly selects a word matching the difficulty

Word is masked (e.g., _ _ _ _ _ for a 5-letter word)

Making Guesses

Guess single letters or the entire word

Correct letter guesses reveal all positions

Wrong guesses reduce remaining attempts

Cannot guess the same letter twice

Winning Conditions

Reveal all letters through correct guesses

Guess the full word correctly

AI opponent guesses your word

Losing Conditions

Run out of attempts

AI opponent fails to guess your word

📁 Project Structure
text
codewords-game/
├── backend/
│   ├── src/
│   │   ├── index.js              # Main server entry
│   │   ├── gameLogic.js           # Core game mechanics
│   │   ├── aiWordGenerator.js     # AI word generation
│   │   ├── aiOpponent.js          # AI opponent logic
│   │   └── difficulty.js          # Difficulty settings
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameBoard.js       # Word display
│   │   │   ├── GuessInput.js      # Guess input form
│   │   │   ├── DifficultySelector.js # Difficulty UI
│   │   │   ├── CustomDifficulty.js # Custom settings
│   │   │   └── AIOpponent.js      # AI mode UI
│   │   ├── services/
│   │   │   └── api.js             # API calls
│   │   ├── App.js                  # Main component
│   │   └── App.css                  # Global styles
│   ├── package.json
│   └── .env
├── package.json (root)
└── README.md
🚀 Installation
Prerequisites
Node.js (v14 or higher)

npm (v6 or higher)

GitHub account (for API token)

Step 1: Clone the Repository
bash
git clone https://github.com/yourusername/codewords-game.git
cd codewords-game
Step 2: Install Dependencies
bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
Step 3: Set Up Environment Variables
Backend (backend/.env):

env
PORT=8080
GITHUB_TOKEN=your_github_token_here
Frontend (frontend/.env):

env
REACT_APP_API_URL=http://localhost:8080
Step 4: Get Your GitHub Token
Go to GitHub Settings

Click "Generate new token (classic)"

Name it "CodeWords AI"

No permissions needed - just generate the token

Copy and paste into backend/.env

🎮 Running the Game
Development Mode (with auto-reload)
bash
# From the root directory
npm run dev
This starts:

Backend: http://localhost:8080

Frontend: http://localhost:3000

Production Mode
bash
npm run start
Run Separately
bash
# Backend only
npm run start-backend

# Frontend only
npm run start-frontend
🎯 Game Modes
Mode 1: Classic Player Mode
The computer selects a word, and you try to guess it:

Select difficulty

Start guessing letters or the full word

Watch the word reveal with correct guesses

Win by revealing all letters!

Mode 2: AI Opponent Mode
You choose the word, and AI tries to guess it:

Click "Play vs AI" button

Enter your secret word (3-10 letters)

Watch AI make strategic guesses

Enable "Auto-play" to watch AI play automatically

AI wins if it guesses your word

📡 API Documentation
Start New Game
http
POST /game
Body:

json
{
  "difficulty": "medium",
  "useAI": true,
  "customSettings": null
}
Make a Guess
http
POST /game/{gameId}/guess
Body:

json
{
  "guess": "a"
}
Get Game State
http
GET /game/{gameId}
Start AI Opponent Game
http
POST /game/ai-opponent
Body:

json
{
  "word": "puzzle",
  "difficulty": "medium"
}
Make AI Guess
http
POST /game/ai-opponent/{gameId}/guess
🤖 AI Integration
GitHub Models
The game uses GitHub's free AI models API for:

Word Generation: Creates unique, contextually appropriate words

AI Opponent: Makes intelligent guesses based on patterns

Fallback Strategy: Common letter frequency when API is unavailable

Available Models
javascript
[
  "AI21-Jamba-1.5-Mini",     // Fast, good for word games
  "Mistral-small",            // Balanced performance
  "Phi-3-mini-4k-instruct",   // Microsoft's efficient model
  "Cohere-command-r-08-2024", // Great for reasoning
  "Meta-Llama-3.1-8B-Instruct" // Most powerful
]
AI Strategy
The AI opponent uses multiple strategies:

AI-Powered - Uses language models to make educated guesses

Common Letters - Falls back to 'etaoin' frequency order

Pattern Recognition - Analyzes word patterns

Process of Elimination - Tries remaining letters

📸 Screenshots
[Add your screenshots here]

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
GitHub Models for free AI API access

React for the amazing UI library

Express for the lightweight backend framework

🐛 Troubleshooting
Common Issues
Q: AI word generation fails with model errors
A: The free API sometimes has rate limits. The game automatically falls back to the word list.

Q: AI opponent repeats guesses
A: This is normal with free tier. The game doesn't deduct attempts for repeats.

Q: CORS errors
A: Make sure backend is running on port 8080 and frontend on 3000.

Q: GitHub token not working
A: Generate a new token with no permissions - it just needs to exist!

📊 Performance
Response Time: 1-3 seconds for AI operations

Memory Usage: ~50MB backend, ~100MB frontend

API Rate Limits: ~100 requests/hour on free tier

🎯 Future Enhancements
Multiplayer mode

Leaderboards and statistics

More AI models

Sound effects

Dark mode

Progressive Web App (PWA)

Made with ❤️ for word game enthusiasts