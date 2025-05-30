
// Dummy WordPress sync file to prevent import errors
// WordPress features have been removed from WeParlay

export const initWordPressSync = () => {
  console.warn('WordPress sync has been disabled for WeParlay');
  return Promise.resolve();
};

export const wordpressSync = () => {
  console.warn('WordPress sync has been disabled for WeParlay');
  return Promise.resolve();
};

export default {
  initWordPressSync,
  wordpressSync
};
