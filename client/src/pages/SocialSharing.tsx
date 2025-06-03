import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitch,
  Copy,
  Eye,
  Heart,
  MessageCircle,
  Zap,
  Trophy,
  Target,
  Users,
  TrendingUp,
  Calendar,
  Image as ImageIcon,
  Video,
  Download,
  Edit,
  Send
} from 'lucide-react';

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'gif';
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  hashtags: string[];
  mentions: string[];
}

interface EsportsContent {
  id: string;
  type: 'match_result' | 'highlight' | 'tournament' | 'player_stat';
  title: string;
  description: string;
  teams?: string[];
  players?: string[];
  score?: string;
  tournament?: string;
  date: Date;
  thumbnailUrl: string;
  videoUrl?: string;
  stats?: any;
}

export default function SocialSharing() {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<EsportsContent | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'facebook']);
  const [autoHashtags, setAutoHashtags] = useState(true);
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const { data: esportsContent } = useQuery({
    queryKey: ['/api/esports/shareable-content'],
    staleTime: 300000,
  });

  const { data: socialAccounts } = useQuery({
    queryKey: ['/api/social/accounts'],
    staleTime: 600000,
  });

  const shareContentMutation = useMutation({
    mutationFn: async (shareData: any) => {
      const response = await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content Shared Successfully",
        description: "Your esports content has been shared across selected platforms",
      });
    },
    onError: () => {
      toast({
        title: "Sharing Failed",
        description: "Unable to share content. Please check your social media connections.",
        variant: "destructive",
      });
    }
  });

  const mockEsportsContent: EsportsContent[] = [
    {
      id: '1',
      type: 'match_result',
      title: 'Team Liquid defeats FaZe Clan 16-14',
      description: 'Incredible comeback victory in CS:GO Major Championship semifinals',
      teams: ['Team Liquid', 'FaZe Clan'],
      score: '16-14',
      tournament: 'CS:GO Major Championship',
      date: new Date(),
      thumbnailUrl: '/api/placeholder/400/300',
      videoUrl: 'https://example.com/highlight.mp4',
      stats: { duration: '47 minutes', viewers: '2.3M' }
    },
    {
      id: '2',
      type: 'highlight',
      title: 'Faker\'s Legendary Outplay',
      description: '1v3 clutch that secured the championship for T1',
      players: ['Faker'],
      tournament: 'League of Legends World Championship',
      date: new Date(Date.now() - 3600000),
      thumbnailUrl: '/api/placeholder/400/300',
      videoUrl: 'https://example.com/faker-play.mp4',
      stats: { duration: '45 seconds', viewers: '5.7M' }
    },
    {
      id: '3',
      type: 'tournament',
      title: 'WeParlay Esports Championship 2025',
      description: 'Join the biggest esports tournament of the year with $1M prize pool',
      tournament: 'WeParlay Championship',
      date: new Date(Date.now() + 86400000),
      thumbnailUrl: '/api/placeholder/400/300',
      stats: { teams: 32, prizePool: '$1,000,000' }
    }
  ];

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-blue-500', connected: true },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', connected: true },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', connected: false },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500', connected: true },
    { id: 'twitch', name: 'Twitch', icon: Twitch, color: 'text-purple-500', connected: false },
  ];

  const generateShareText = (content: EsportsContent) => {
    const hashtags = autoHashtags ? generateHashtags(content) : [];
    const mentions = generateMentions(content);
    
    let shareText = '';
    switch (content.type) {
      case 'match_result':
        shareText = `🏆 MATCH RESULT: ${content.title}\n\n${content.description}\n\nScore: ${content.score}\nTournament: ${content.tournament}`;
        break;
      case 'highlight':
        shareText = `⚡ EPIC HIGHLIGHT: ${content.title}\n\n${content.description}\n\nWatch this incredible play!`;
        break;
      case 'tournament':
        shareText = `🎮 TOURNAMENT ALERT: ${content.title}\n\n${content.description}\n\nDon't miss out!`;
        break;
      default:
        shareText = content.description;
    }

    if (hashtags.length > 0) {
      shareText += '\n\n' + hashtags.join(' ');
    }

    if (mentions.length > 0) {
      shareText += '\n\n' + mentions.join(' ');
    }

    return shareText;
  };

  const generateHashtags = (content: EsportsContent): string[] => {
    const tags = ['#Esports', '#WeParlay', '#Gaming'];
    
    if (content.tournament) {
      tags.push(`#${content.tournament.replace(/\s+/g, '')}`);
    }
    
    if (content.teams) {
      content.teams.forEach(team => {
        tags.push(`#${team.replace(/\s+/g, '')}`);
      });
    }

    switch (content.type) {
      case 'match_result':
        tags.push('#MatchResult', '#Victory');
        break;
      case 'highlight':
        tags.push('#Highlight', '#EpicPlay');
        break;
      case 'tournament':
        tags.push('#Tournament', '#Competition');
        break;
    }

    return tags.slice(0, 8); // Limit hashtags
  };

  const generateMentions = (content: EsportsContent): string[] => {
    const mentions: string[] = [];
    
    if (content.teams) {
      content.teams.forEach(team => {
        mentions.push(`@${team.replace(/\s+/g, '')}`);
      });
    }

    if (content.players) {
      content.players.forEach(player => {
        mentions.push(`@${player}`);
      });
    }

    return mentions.slice(0, 3); // Limit mentions
  };

  const handleShare = () => {
    if (!selectedContent) return;

    const shareText = customMessage || generateShareText(selectedContent);
    
    const shareData = {
      contentId: selectedContent.id,
      platforms: selectedPlatforms,
      message: shareText,
      mediaUrl: selectedContent.thumbnailUrl,
      mediaType: selectedContent.videoUrl ? 'video' : 'image',
      scheduled: schedulePost,
      scheduledTime: schedulePost ? scheduledTime : null,
      hashtags: generateHashtags(selectedContent),
      mentions: generateMentions(selectedContent)
    };

    shareContentMutation.mutate(shareData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Share text has been copied to your clipboard",
    });
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return Share2;
    return platform.icon;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">One-Click Social Media Sharing</h1>
          <p className="text-muted-foreground">Share your esports content across multiple platforms instantly</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
          <Zap className="h-4 w-4 mr-2" />
          Quick Share
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5" />
                Select Content to Share
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockEsportsContent.map((content) => (
                  <div
                    key={content.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedContent?.id === content.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onClick={() => setSelectedContent(content)}
                  >
                    <div className="space-y-3">
                      <div className="aspect-video bg-muted rounded flex items-center justify-center">
                        {content.videoUrl ? (
                          <Video className="h-8 w-8 text-white" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-white" />
                        )}
                      </div>
                      
                      <div>
                        <Badge className="mb-2 capitalize">
                          {content.type.replace('_', ' ')}
                        </Badge>
                        <h3 className="font-semibold text-white text-sm line-clamp-2">
                          {content.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {content.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{content.date.toLocaleDateString()}</span>
                        {content.stats && (
                          <span>
                            {content.stats.viewers || content.stats.teams || 'Popular'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Share Preview */}
          {selectedContent && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Eye className="h-5 w-5" />
                  Share Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                  <Textarea
                    id="customMessage"
                    placeholder={generateShareText(selectedContent)}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Preview:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {customMessage || generateShareText(selectedContent)}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(customMessage || generateShareText(selectedContent))}
                    className="mt-2"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Share Settings */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Share2 className="h-5 w-5" />
                Share Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div>
                <Label className="text-sm font-medium">Select Platforms</Label>
                <div className="space-y-2 mt-2">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div key={platform.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={platform.id}
                          checked={selectedPlatforms.includes(platform.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlatforms([...selectedPlatforms, platform.id]);
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                            }
                          }}
                          disabled={!platform.connected}
                          className="rounded"
                        />
                        <Icon className={`h-4 w-4 ${platform.color}`} />
                        <label htmlFor={platform.id} className="text-sm text-white flex-1">
                          {platform.name}
                        </label>
                        {!platform.connected && (
                          <Badge variant="secondary" className="text-xs">
                            Disconnected
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Auto Features */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoHashtags" className="text-sm">Auto-generate hashtags</Label>
                  <Switch
                    id="autoHashtags"
                    checked={autoHashtags}
                    onCheckedChange={setAutoHashtags}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="schedulePost" className="text-sm">Schedule post</Label>
                  <Switch
                    id="schedulePost"
                    checked={schedulePost}
                    onCheckedChange={setSchedulePost}
                  />
                </div>

                {schedulePost && (
                  <div>
                    <Label htmlFor="scheduledTime" className="text-sm">Schedule Time</Label>
                    <Input
                      id="scheduledTime"
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Share Button */}
              <Button
                onClick={handleShare}
                disabled={!selectedContent || selectedPlatforms.length === 0 || shareContentMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {shareContentMutation.isPending ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Share Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Shares */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                Recent Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    platform: 'Twitter',
                    content: 'Team Liquid victory',
                    engagement: { likes: 247, shares: 43, comments: 28 },
                    time: '2h ago'
                  },
                  {
                    platform: 'Facebook',
                    content: 'Faker highlight reel',
                    engagement: { likes: 892, shares: 156, comments: 89 },
                    time: '5h ago'
                  },
                  {
                    platform: 'YouTube',
                    content: 'Tournament recap',
                    engagement: { likes: 1240, shares: 78, comments: 145 },
                    time: '1d ago'
                  }
                ].map((share, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {React.createElement(getPlatformIcon(share.platform.toLowerCase()), {
                          className: "h-4 w-4 text-blue-500"
                        })}
                        <span className="text-sm font-medium text-white">{share.platform}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{share.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{share.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {share.engagement.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {share.engagement.shares}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {share.engagement.comments}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}