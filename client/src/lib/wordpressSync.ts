// WordPress synchronization utilities for WeParlay
export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private';
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  date: string;
  modified: string;
}

export interface WordPressPage {
  id: number;
  title: string;
  content: string;
  slug: string;
  status: 'publish' | 'draft' | 'private';
  parent: number;
  menu_order: number;
  template: string;
  date: string;
  modified: string;
}

export class WordPressAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async createPost(post: Partial<WordPressPost>): Promise<WordPressPost> {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(post)
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }

    return response.json();
  }

  async updatePost(id: number, post: Partial<WordPressPost>): Promise<WordPressPost> {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(post)
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.statusText}`);
    }

    return response.json();
  }

  async getPosts(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    categories?: number[];
    tags?: number[];
    status?: string;
  }): Promise<WordPressPost[]> {
    const url = new URL(`${this.baseUrl}/wp-json/wp/v2/posts`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            url.searchParams.append(key, value.join(','));
          } else {
            url.searchParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return response.json();
  }

  async createPage(page: Partial<WordPressPage>): Promise<WordPressPage> {
    const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(page)
    });

    if (!response.ok) {
      throw new Error(`Failed to create page: ${response.statusText}`);
    }

    return response.json();
  }

  async syncWeParleyContent(): Promise<void> {
    // Sync betting odds to WordPress
    try {
      const oddsData = await this.fetchWeParleyOdds();
      await this.createPost({
        title: `WeParlay Odds Update - ${new Date().toLocaleDateString()}`,
        content: this.formatOddsContent(oddsData),
        status: 'publish',
        categories: [1], // Adjust category ID as needed
        tags: [1, 2] // Adjust tag IDs as needed
      });
    } catch (error) {
      console.error('Failed to sync odds to WordPress:', error);
    }
  }

  private async fetchWeParleyOdds(): Promise<any> {
    // Implement odds fetching logic here
    return {};
  }

  private formatOddsContent(odds: any): string {
    // Format odds data for WordPress content
    return `<div class="weparlay-odds">${JSON.stringify(odds)}</div>`;
  }
}

// Initialize WordPress sync functionality
export async function initWordPressSync(config: { baseUrl: string; apiKey: string }) {
  try {
    const wpApi = new WordPressAPI(config.baseUrl, config.apiKey);

    // Test connection
    await wpApi.getPosts({ per_page: 1 });

    console.log('✅ WordPress sync initialized successfully');
    return wpApi;
  } catch (error) {
    console.error('❌ Failed to initialize WordPress sync:', error);
    throw error;
  }
}