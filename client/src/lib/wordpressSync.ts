
// WeParlay WordPress Integration Service
// Handles content synchronization with WordPress backend

export interface WordPressConfig {
  apiUrl: string;
  username?: string;
  apiKey?: string;
}

export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private';
  categories: string[];
  tags: string[];
  featured_media?: string;
  date: string;
}

class WordPressSync {
  private config: WordPressConfig;
  private isInitialized = false;

  constructor(config: WordPressConfig) {
    this.config = config;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔌 Initializing WordPress sync...');
      
      // Test connection to WordPress API
      const response = await fetch(`${this.config.apiUrl}/wp-json/wp/v2/posts?per_page=1`);
      
      if (response.ok) {
        this.isInitialized = true;
        console.log('✅ WordPress sync initialized successfully');
        return true;
      } else {
        console.warn('⚠️ WordPress API not available, running in offline mode');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ WordPress sync initialization failed, continuing without sync:', error);
      return false;
    }
  }

  async syncPosts(): Promise<WordPressPost[]> {
    if (!this.isInitialized) {
      console.log('📝 WordPress sync not initialized, returning empty posts');
      return [];
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/wp-json/wp/v2/posts`);
      if (response.ok) {
        const posts = await response.json();
        console.log(`📰 Synced ${posts.length} posts from WordPress`);
        return posts;
      }
    } catch (error) {
      console.warn('Failed to sync WordPress posts:', error);
    }
    
    return [];
  }

  async publishPost(post: Partial<WordPressPost>): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('📝 WordPress sync not available for publishing');
      return false;
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : '',
        },
        body: JSON.stringify(post),
      });

      return response.ok;
    } catch (error) {
      console.warn('Failed to publish to WordPress:', error);
      return false;
    }
  }
}

// Default WordPress configuration for WeParlay
const defaultConfig: WordPressConfig = {
  apiUrl: process.env.WORDPRESS_API_URL || 'https://weparlay.io',
};

// Global WordPress sync instance
let wordpressSync: WordPressSync | null = null;

export async function initWordPressSync(config?: WordPressConfig): Promise<boolean> {
  try {
    const finalConfig = config || defaultConfig;
    wordpressSync = new WordPressSync(finalConfig);
    
    const success = await wordpressSync.initialize();
    
    if (success) {
      console.log('🚀 WordPress sync ready for WeParlay content management');
    } else {
      console.log('📱 Running WeParlay in standalone mode (no WordPress sync)');
    }
    
    return success;
  } catch (error) {
    console.warn('WordPress sync initialization error:', error);
    return false;
  }
}

export function getWordPressSync(): WordPressSync | null {
  return wordpressSync;
}

// Auto-initialize with graceful fallback
export async function autoInitWordPressSync(): Promise<void> {
  try {
    await initWordPressSync();
  } catch (error) {
    console.log('WeParlay running without WordPress integration');
  }
}

// Export for external use
export { WordPressSync };
export default { initWordPressSync, getWordPressSync, autoInitWordPressSync };
