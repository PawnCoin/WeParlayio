
// Dummy WordPress sync file to prevent import errors
// WordPress features have been completely removed from WeParlay

export function initWordPressSync() {
  console.warn('WordPress sync has been disabled for WeParlay');
  return Promise.resolve();
}

export function wordpressSync() {
  console.warn('WordPress sync has been disabled for WeParlay');
  return Promise.resolve();
}

// Default export as well to catch any default imports
export default {
  initWordPressSync,
  wordpressSync
};
