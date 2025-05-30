
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, User, Tag, RefreshCw } from 'lucide-react';
import { useWordPress } from '../../contexts/WordPressContext';

export const WordPressBlog: React.FC = () => {
  const { posts, bettingTips, isLoading, lastSync, syncContent } = useWordPress();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading WordPress content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">WeParlay Blog</h2>
        <div className="flex items-center gap-4">
          {lastSync && (
            <span className="text-sm text-muted-foreground">
              Last updated: {formatDate(lastSync.toISOString())}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={syncContent}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Latest Betting Tips */}
      {bettingTips.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Latest Betting Tips</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {bettingTips.slice(0, 4).map((tip) => (
              <Card key={tip.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{tip.sport}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Confidence: {tip.confidence}%
                    </span>
                  </div>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {stripHtml(tip.content).substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {tip.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(tip.date)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Latest Blog Posts */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Latest Articles</h3>
          <div className="grid gap-6">
            {posts.slice(0, 3).map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    {stripHtml(post.excerpt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(post.date)}
                    </div>
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4" />
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && bettingTips.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No WordPress content available. Check your connection or try refreshing.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WordPressBlog;
