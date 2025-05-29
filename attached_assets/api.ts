import axios from 'axios';
import { ApiResponse, LiveGame, Sport } from '../types';

// This would be your actual API endpoint in production
const API_BASE_URL = '/api';

// For development, we'll mock the API
const USE_MOCK_DATA = true;

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
const mockSports: Sport[] = [
  { id: 'football', name: 'Football', slug: 'football', iconName: 'Footprints' },
  { id: 'basketball', name: 'Basketball', slug: 'basketball', iconName: 'CircleDot' },
  { id: 'baseball', name: 'Baseball', slug: 'baseball', iconName: 'CircleDashed' },
  { id: 'hockey', name: 'Hockey', slug: 'hockey', iconName: 'Snowflake' },
  { id: 'soccer', name: 'Soccer', slug: 'soccer', iconName: 'CircleDotDashed' },
  { id: 'esports', name: 'Esports', slug: 'esports', iconName: 'Gamepad2' },
];

const mockGames: LiveGame[] = [
  {
    id: 'game1',
    sportId: 'football',
    title: 'Kansas City Chiefs vs San Francisco 49ers',
    homeTeam: {
      id: 'chiefs',
      name: 'Kansas City Chiefs',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 24
    },
    awayTeam: {
      id: '49ers',
      name: 'San Francisco 49ers',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 21
    },
    startTime: new Date().toISOString(),
    status: 'live',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.pexels.com/photos/4586683/pexels-photo-4586683.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    leagueName: 'NFL',
    period: '4th Quarter',
    timeRemaining: '02:14',
    odds: {
      homeWin: 1.85,
      awayWin: 1.95,
    },
    isEsport: false
  },
  {
    id: 'game2',
    sportId: 'basketball',
    title: 'Los Angeles Lakers vs Boston Celtics',
    homeTeam: {
      id: 'lakers',
      name: 'Los Angeles Lakers',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 89
    },
    awayTeam: {
      id: 'celtics',
      name: 'Boston Celtics',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 92
    },
    startTime: new Date().toISOString(),
    status: 'live',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    leagueName: 'NBA',
    period: '3rd Quarter',
    timeRemaining: '05:22',
    odds: {
      homeWin: 2.10,
      awayWin: 1.75,
    },
    isEsport: false
  },
  {
    id: 'game3',
    sportId: 'esports',
    title: 'Team Liquid vs Cloud9',
    homeTeam: {
      id: 'liquid',
      name: 'Team Liquid',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 1
    },
    awayTeam: {
      id: 'cloud9',
      name: 'Cloud9',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 1
    },
    startTime: new Date().toISOString(),
    status: 'live',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    leagueName: 'LCS',
    period: 'Game 3',
    timeRemaining: '',
    odds: {
      homeWin: 1.65,
      awayWin: 2.25,
    },
    isEsport: true
  },
  {
    id: 'game4',
    sportId: 'soccer',
    title: 'Manchester United vs Liverpool',
    homeTeam: {
      id: 'manutd',
      name: 'Manchester United',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 1
    },
    awayTeam: {
      id: 'liverpool',
      name: 'Liverpool',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 2
    },
    startTime: new Date().toISOString(),
    status: 'live',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    leagueName: 'Premier League',
    period: '2nd Half',
    timeRemaining: '23:15',
    odds: {
      homeWin: 3.50,
      draw: 3.25,
      awayWin: 2.00,
    },
    isEsport: false
  },
  {
    id: 'game5',
    sportId: 'esports',
    title: 'FaZe Clan vs Natus Vincere',
    homeTeam: {
      id: 'faze',
      name: 'FaZe Clan',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 12
    },
    awayTeam: {
      id: 'navi',
      name: 'Natus Vincere',
      logo: 'https://images.pexels.com/photos/209841/pexels-photo-209841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      score: 9
    },
    startTime: new Date().toISOString(),
    status: 'live',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.pexels.com/photos/7915547/pexels-photo-7915547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    leagueName: 'ESL Pro League',
    period: 'Map 1',
    timeRemaining: '',
    odds: {
      homeWin: 1.90,
      awayWin: 1.90,
    },
    isEsport: true
  }
];

export { mockSports, mockGames };