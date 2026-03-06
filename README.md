# CodeWords Game

A full-stack word-guessing game (mashup of Hangman and Wordle) with Node.js backend and React frontend.

## 🎮 Game Rules

- The computer selects a random word
- You have 6 attempts to guess the word
- You can guess a single letter or the entire word
- Correct letter guesses reveal that letter in all positions
- Wrong guesses reduce remaining attempts
- Win by revealing all letters or guessing the full word correctly

## 🏗️ Project Structure

This is a monorepo containing:
- `backend/` - Node.js/Express API
- `frontend/` - React application

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/codewords-game.git
   cd codewords-game