
// NO MOCK DATA - Only real API data allowed
export const additionalSportsData = {};

// All functions return empty arrays - no mock data
export function getMockEventsForSport(sportKey: string) {
  console.warn('Mock data requested but disabled. Please use real API endpoints.');
  return [];
}

export function getMockTournaments() {
  console.warn('Mock tournaments disabled. Please configure real tournament APIs.');
  return [];
}

export function getMockPlayerStats() {
  console.warn('Mock player stats disabled. Please use real player stat APIs.');
  return [];
}

export function getMockLiveEvents() {
  console.warn('Mock live events disabled. Please use real live event APIs.');
  return [];
}

// Export empty objects to prevent errors
export const mockSportsData = {};
export const demoData = {};
export const fakeData = {};
export const placeholderData = {};
