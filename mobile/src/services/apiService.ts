/**
 * API Service for WeParlay Mobile App
 * 
 * This service handles all API requests to the backend server.
 * It's designed to work with the same endpoints as the web app.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

// Define API base URL
// In development, this will be the local server
// In production, this will be the deployed API server
const API_BASE_URL = Config.API_URL || 'https://your-api-domain.replit.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API Functions

// Sports
export const fetchSports = async () => {
  const response = await api.get('/api/sports');
  return response.data;
};

// Events
export const fetchUpcomingEvents = async (limit = 10) => {
  const response = await api.get(`/api/events/upcoming?limit=${limit}`);
  return response.data;
};

export const fetchLiveEvents = async () => {
  const response = await api.get('/api/events/live');
  return response.data;
};

export const fetchEventById = async (eventId: number) => {
  const response = await api.get(`/api/events/${eventId}`);
  return response.data;
};

// Odds
export const fetchOdds = async (eventId: number) => {
  const response = await api.get(`/api/odds/${eventId}`);
  return response.data;
};

// Tournaments
export const fetchTournaments = async (sportId?: number) => {
  const url = sportId ? `/api/tournaments?sportId=${sportId}` : '/api/tournaments';
  const response = await api.get(url);
  return response.data;
};

export const fetchTournamentById = async (tournamentId: number) => {
  const response = await api.get(`/api/tournaments/${tournamentId}`);
  return response.data;
};

// User
export const fetchUserProfile = async () => {
  const response = await api.get('/api/auth/user');
  return response.data;
};

export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/api/login', credentials);
  if (response.data.token) {
    await AsyncStorage.setItem('auth_token', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('auth_token');
  return { success: true };
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/api/register', userData);
  if (response.data.token) {
    await AsyncStorage.setItem('auth_token', response.data.token);
  }
  return response.data;
};

// Bets
export const placeBet = async (betData: any) => {
  const response = await api.post('/api/bets', betData);
  return response.data;
};

export const fetchUserBets = async () => {
  const response = await api.get('/api/bets/user');
  return response.data;
};

// Yahoo Fantasy
export const connectYahooFantasy = async () => {
  const response = await api.get('/api/yahoo/auth');
  return response.data;
};

export const fetchYahooFantasyTeams = async () => {
  const response = await api.get('/api/yahoo/teams');
  return response.data;
};

export const fetchYahooFantasyTeamRoster = async (teamKey: string) => {
  const response = await api.get(`/api/yahoo/team/${teamKey}/roster`);
  return response.data;
};

// Cryptocurrency
export const fetchCryptoWalletBalance = async (address: string) => {
  const response = await api.get(`/api/crypto/balance?address=${address}`);
  return response.data;
};

// VIP Features
export const fetchVipFeatures = async () => {
  const response = await api.get('/api/vip/features');
  return response.data;
};

// General API error handler
export const handleApiError = (error: any) => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorMessage = error.response.data.message || `Error ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message;
  }
  
  return {
    error: true,
    message: errorMessage,
  };
};

export default {
  fetchSports,
  fetchUpcomingEvents,
  fetchLiveEvents,
  fetchEventById,
  fetchOdds,
  fetchTournaments,
  fetchTournamentById,
  fetchUserProfile,
  login,
  logout,
  registerUser,
  placeBet,
  fetchUserBets,
  connectYahooFantasy,
  fetchYahooFantasyTeams,
  fetchYahooFantasyTeamRoster,
  fetchCryptoWalletBalance,
  fetchVipFeatures,
  handleApiError,
};