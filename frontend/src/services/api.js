import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

export const createNewGame = async (difficulty = 'medium', useAI = true) => {
    try {
        console.log('Creating new game with difficulty:', difficulty);
        const response = await api.post('/game', { 
            difficulty, 
            useAI 
        });
        console.log('New game created:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating new game:', error);
        throw error.response?.data || error.message;
    }
};

export const makeGuess = async (gameId, guess) => {
    try {
        const response = await api.post(`/game/${gameId}/guess`, { guess });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getGameState = async (gameId) => {
    try {
        const response = await api.get(`/game/${gameId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDifficulties = async () => {
    try {
        const response = await api.get('/difficulties');
        return response.data;
    } catch (error) {
        console.error('Error fetching difficulties:', error);
        throw error.response?.data || error.message;
    }
};