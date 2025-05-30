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

// Export the service instance
export const wordPressService = new WordPressService();

// Initialize function for backwards compatibility
export const initWordPressSync = () => {
  console.log('WordPress sync service initialized');
  return wordPressService;
};

export default wordPressService;

class WordPressSyncService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async fetchPosts(limit: number = 10): Promise<WordPressPost[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts?per_page=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const posts = await response.json();
      return posts.map(this.transformPost);
    } catch (error) {
      console.error('Error fetching WordPress posts:', error);
      return [];
    }
  }

  async fetchBettingTips(): Promise<WordPressBettingTip[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/betting-tips`);
      if (!response.ok) {
        return []; // Fallback if custom post type doesn't exist
      }

      const tips = await response.json();
      return tips.map(this.transformBettingTip);
    } catch (error) {
      console.error('Error fetching betting tips:', error);
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

// Export the service instance
const wordPressSync = new WordPressSyncService('https://blog.weparlay.com');

export { wordPressSync };

// Export the initialization function
export const initWordPressSync = () => {
  console.log('WordPress sync initialized');
  return wordPressSync;
};

export default wordPressSync;