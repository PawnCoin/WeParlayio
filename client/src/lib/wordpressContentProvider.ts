
import { WordPressPost, WordPressBettingTip, wordPressService } from './wordpressSync';

interface WordPressContent {
  posts: WordPressPost[];
  bettingTips: WordPressBettingTip[];
  lastSync: Date | null;
}

class WordPressContentProvider {
  private content: WordPressContent = {
    posts: [],
    bettingTips: [],
    lastSync: null
  };

  private listeners: Array<(content: WordPressContent) => void> = [];

  async initialize(): Promise<void> {
    await this.syncContent();
  }

  async syncContent(): Promise<void> {
    try {
      const [posts, bettingTips] = await Promise.all([
        wordPressService.getPosts(),
        wordPressService.getBettingTips()
      ]);

      this.content = {
        posts,
        bettingTips,
        lastSync: new Date()
      };

      this.notifyListeners();
    } catch (error) {
      console.error('WordPress content sync failed:', error);
    }
  }

  getContent(): WordPressContent {
    return { ...this.content };
  }

  getPosts(): WordPressPost[] {
    return [...this.content.posts];
  }

  getBettingTips(): WordPressBettingTip[] {
    return [...this.content.bettingTips];
  }

  getLatestPosts(limit: number = 5): WordPressPost[] {
    return this.content.posts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  getLatestBettingTips(limit: number = 5): WordPressBettingTip[] {
    return this.content.bettingTips
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  subscribe(callback: (content: WordPressContent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getContent());
      } catch (error) {
        console.error('WordPress content listener error:', error);
      }
    });
  }
}

export const wordpressContentProvider = new WordPressContentProvider();
export default wordpressContentProvider;
