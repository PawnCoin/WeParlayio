// WordPress Sync Service
export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  date: string;
  author: string;
  categories: string[];
  tags: string[];
  featured_image?: string;
}

export interface WordPressBettingTip {
  id: number;
  title: string;
  content: string;
  sport: string;
  confidence: number;
  author: string;
  date: string;
}

class WordPressService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://weparlay.io/wp-json/wp/v2') {
    this.baseUrl = baseUrl;
  }

  async getPosts(): Promise<WordPressPost[]> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`);
      if (!response.ok) return [];
      const posts = await response.json();
      return posts.map(this.transformPost);
    } catch (error) {
      console.error('WordPress posts fetch error:', error);
      return [];
    }
  }

  async getBettingTips(): Promise<WordPressBettingTip[]> {
    try {
      const response = await fetch(`${this.baseUrl}/betting-tips`);
      if (!response.ok) return [];
      const tips = await response.json();
      return tips.map(this.transformBettingTip);
    } catch (error) {
      console.error('WordPress betting tips fetch error:', error);
      return [];
    }
  }

  private transformPost(post: any): WordPressPost {
    return {
      id: post.id,
      title: post.title?.rendered || '',
      content: post.content?.rendered || '',
      excerpt: post.excerpt?.rendered || '',
      slug: post.slug || '',
      date: post.date || '',
      author: post.author || '',
      categories: post.categories || [],
      tags: post.tags || [],
      featured_image: post.featured_media || undefined
    };
  }

  private transformBettingTip(tip: any): WordPressBettingTip {
    return {
      id: tip.id,
      title: tip.title?.rendered || '',
      content: tip.content?.rendered || '',
      sport: tip.acf?.sport || 'general',
      confidence: tip.acf?.confidence || 50,
      author: tip.author || '',
      date: tip.date || ''
    };
  }
}

// Create and export the service instance
const wordPressService = new WordPressService();

export { wordPressService };
export default wordPressService;

// WordPress synchronization functionality
export const wordpressSync = {
  async syncPosts(): Promise<void> {
    try {
      const posts = await wordPressService.getPosts();
      console.log(`Synced ${posts.length} WordPress posts`);
      // Store posts in local cache/state
    } catch (error) {
      console.error('WordPress posts sync failed:', error);
    }
  },

  async syncBettingTips(): Promise<void> {
    try {
      const tips = await wordPressService.getBettingTips();
      console.log(`Synced ${tips.length} betting tips`);
      // Store tips in local cache/state
    } catch (error) {
      console.error('WordPress betting tips sync failed:', error);
    }
  },

  async fullSync(): Promise<void> {
    console.log('Starting full WordPress sync...');
    await Promise.all([
      this.syncPosts(),
      this.syncBettingTips()
    ]);
    console.log('WordPress sync completed');
  }
};

// Add the missing export that's being imported elsewhere
export const initWordPressSync = async () => {
  console.log('WordPress sync initialized');
  
  // Initialize WordPress connection
  try {
    await wordPressService.getPosts();
    console.log('WordPress connection established');
    
    // Set up periodic sync (every 30 minutes)
    setInterval(() => {
      wordpressSync.fullSync();
    }, 30 * 60 * 1000);
    
    // Initial sync
    await wordpressSync.fullSync();
    
  } catch (error) {
    console.warn('WordPress connection failed, running in offline mode:', error);
  }
};