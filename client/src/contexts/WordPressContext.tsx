
import React, { createContext, useContext, useEffect, useState } from 'react';
import { WordPressPost, WordPressBettingTip } from '../lib/wordpressSync';
import { wordpressContentProvider } from '../lib/wordpressContentProvider';

interface WordPressContextType {
  posts: WordPressPost[];
  bettingTips: WordPressBettingTip[];
  isLoading: boolean;
  lastSync: Date | null;
  syncContent: () => Promise<void>;
}

const WordPressContext = createContext<WordPressContextType | undefined>(undefined);

export const useWordPress = () => {
  const context = useContext(WordPressContext);
  if (context === undefined) {
    throw new Error('useWordPress must be used within a WordPressProvider');
  }
  return context;
};

interface WordPressProviderProps {
  children: React.ReactNode;
}

export const WordPressProvider: React.FC<WordPressProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [bettingTips, setBettingTips] = useState<WordPressBettingTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const initializeWordPress = async () => {
      try {
        await wordpressContentProvider.initialize();
        const content = wordpressContentProvider.getContent();
        setPosts(content.posts);
        setBettingTips(content.bettingTips);
        setLastSync(content.lastSync);
      } catch (error) {
        console.error('WordPress initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWordPress();

    const unsubscribe = wordpressContentProvider.subscribe((content) => {
      setPosts(content.posts);
      setBettingTips(content.bettingTips);
      setLastSync(content.lastSync);
    });

    return unsubscribe;
  }, []);

  const syncContent = async () => {
    setIsLoading(true);
    try {
      await wordpressContentProvider.syncContent();
    } finally {
      setIsLoading(false);
    }
  };

  const value: WordPressContextType = {
    posts,
    bettingTips,
    isLoading,
    lastSync,
    syncContent
  };

  return (
    <WordPressContext.Provider value={value}>
      {children}
    </WordPressContext.Provider>
  );
};
