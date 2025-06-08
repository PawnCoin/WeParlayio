import axios from 'axios';
import { ApiResponse, LiveGame, Sport } from '../types';

// This would be your actual API endpoint in production
const API_BASE_URL = '/api';

// For development, we'll mock the API
const USE_MOCK_DATA = false;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods
export const fetchLiveSports = async (): Promise<Sport[]> => {
  if (USE_MOCK_DATA) {
    return mockSports;
  }
  
  const response = await apiClient.get<ApiResponse<Sport[]>>('/sports/live');
  return response.data.data;
};

export const fetchLiveGames = async (sportId?: string): Promise<LiveGame[]> => {
  if (USE_MOCK_DATA) {
    return sportId 
      ? mockGames.filter(game => game.sportId === sportId)
      : mockGames;
  }
  
  const endpoint = sportId ? `/games/live/${sportId}` : '/games/live';
  const response = await apiClient.get<ApiResponse<LiveGame[]>>(endpoint);
  return response.data.data;
};

// Mock data for development
const mockSports: Sport[] = [];

const mockGames: LiveGame[] = [];

export { mockSports, mockGames };