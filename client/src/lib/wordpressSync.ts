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