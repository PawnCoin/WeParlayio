// sportDataService.ts
// This file provides a service to interact with sports data APIs

import { apiRequest } from "@/lib/queryClient";

/**
 * Fetches live events for a given sport
 */
export const getLiveEvents = async (sportKey: string) => {
  try {
    const response = await apiRequest('GET', `/api/sports/${sportKey}/live`);
    return response.json();
  } catch (error) {
    console.error("Error fetching live events:", error);
    return [];
  }
};

/**
 * Fetches upcoming events for a given sport
 */
export const getUpcomingEvents = async (sportKey: string) => {
  try {
    const response = await apiRequest('GET', `/api/sports/${sportKey}/upcoming`);
    return response.json();
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }
};

/**
 * Fetches available sports
 */
export const getSports = async () => {
  try {
    const response = await apiRequest('GET', '/api/sports');
    return response.json();
  } catch (error) {
    console.error("Error fetching sports:", error);
    return [];
  }
};

/**
 * Places a bet
 */
export const placeBet = async (betData: any) => {
  try {
    const response = await apiRequest('POST', '/api/bets', betData);
    return response.json();
  } catch (error) {
    console.error("Error placing bet:", error);
    throw error;
  }
};

/**
 * Fetches user's bet history
 */
export const getUserBets = async (userId: number) => {
  try {
    const response = await apiRequest('GET', `/api/users/${userId}/bets`);
    return response.json();
  } catch (error) {
    console.error("Error fetching user bets:", error);
    return [];
  }
};

/**
 * Gets current user's balance
 */
export const getUserBalance = async (userId: number) => {
  try {
    const response = await apiRequest('GET', `/api/users/${userId}`);
    const userData = await response.json();
    return userData.balance || 0;
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return 0;
  }
};