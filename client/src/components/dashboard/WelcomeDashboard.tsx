import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calendar, Star, TrendingUp, Zap, Clock, ArrowRight, Flame, Gift, ThumbsUp } from 'lucide-react';
import { Link } from 'wouter';

interface RecommendationProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
  type: 'bet' | 'feature' | 'event';
  matchPercentage?: number;
}

const WelcomeDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendationProps[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Fetch real upcoming events from unified sports endpoint
  const { data: upcomingEventsData, isLoading: isLoadingUpcomingEvents } = useQuery({
    queryKey: ['/api/unified-sports/upcoming-events'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  // Get time of day for personalized greeting
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setTimeOfDay('Morning');
    else if (hours < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
    
    // Load personalized recommendations (simulate API call)
    setTimeout(() => {
      setRecommendations(generateRecommendations());
      setLoadingRecommendations(false);
    }, 1500);
    
    // Auto hide welcome message after 7 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 7000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to generate recommendations based on user preferences
  // In a real app, this would be done on the server based on user data
  const generateRecommendations = (): RecommendationProps[] => {
    return [
      {
        id: '1',
        title: 'NBA Finals - Special Parlay',
        description: "Based on your previous bets, we think you'll like this curated parlay for today's NBA Finals game.",
        icon: <Flame className="h-5 w-5 text-orange-500" />,
        link: '/live-betting',
        linkText: 'View Parlay',
        type: 'bet',
        matchPercentage: 92
      },
      {
        id: '2',
        title: 'Try Voice Betting',
        description: "Place bets faster with our new voice command feature. Just tap the mic and say your bet!",
        icon: <Zap className="h-5 w-5 text-blue-500" />,
        link: '/enhanced-features',
        linkText: 'Try It Now',
        type: 'feature',
        matchPercentage: 85
      },
      {
        id: '3',
        title: 'UFC Fight Night - VIP Early Access',
        description: "Get early access to exclusive UFC fight night odds with your VIP membership.",
        icon: <Star className="h-5 w-5 text-yellow-500" />,
        link: '/vip',
        linkText: 'Unlock VIP',
        type: 'event',
        matchPercentage: 78
      },
      {
        id: '4',
        title: 'Connect Your Yahoo Fantasy Team',
        description: "Sync your Yahoo Fantasy team to get personalized recommendations based on your roster.",
        icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
        link: '/fantasy',
        linkText: 'Connect Now',
        type: 'feature',
        matchPercentage: 95
      }
    ];
  };
  
  // Process real upcoming events data
  const processUpcomingEvents = (data: any) => {
    if (!data?.events) return [];
    
    return data.events.slice(0, 3).map((event: any) => ({
      id: event.id,
      title: `${event.awayTeam} vs. ${event.homeTeam}`,
      time: new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit'
      }),
      league: event.sport || event.league || 'Sports',
      hot: Math.random() > 0.5 // Randomly assign hot status for variety
    }));
  };

  const upcomingEvents = processUpcomingEvents(upcomingEventsData);
  
  // If user is not authenticated, don't show the personalized welcome
  if (!isAuthenticated) return null;
  
  return (
    <div className="space-y-6">
      {/* Animated welcome message */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold"
                >
                  Good {timeOfDay}, {user?.firstName || 'Bettor'}!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-2 text-blue-100"
                >
                  Welcome back to WeParlay. We've prepared some personalized recommendations just for you.
                </motion.p>
              </div>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-blue-700/20" 
                onClick={() => setShowWelcome(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 6 }}
              className="h-1 bg-white/30 mt-4 rounded-full overflow-hidden"
            >
              <div className="h-full bg-white rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dashboard content */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations" className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Recommended For You
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>
        
        {/* Recommendations tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingRecommendations ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                        <div className="flex-1 space-y-4 py-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                {recommendations.map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link href={rec.link}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col h-full">
                            {/* Header with match percentage */}
                            <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                  {rec.icon}
                                </div>
                                <Badge variant="secondary" className="ml-2">
                                  {rec.type === 'bet' ? 'Betting' : rec.type === 'feature' ? 'Feature' : 'Event'}
                                </Badge>
                              </div>
                              {rec.matchPercentage && (
                                <Badge className="bg-green-500 hover:bg-green-600">
                                  {rec.matchPercentage}% Match
                                </Badge>
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="p-4 flex-1">
                              <h3 className="font-medium text-lg mb-2">{rec.title}</h3>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {rec.description}
                              </p>
                            </div>
                            
                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Personalized for you
                                </span>
                                <Button size="sm" className="gap-1 h-8">
                                  {rec.linkText}
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </TabsContent>
        
        {/* Upcoming events tab */}
        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoadingUpcomingEvents ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-full border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-6 w-16"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: any) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant={event.league === 'NBA' ? 'default' : event.league === 'UFC' ? 'destructive' : 'outline'}>
                          {event.league}
                        </Badge>
                        {event.hot && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900">
                            <Flame className="h-3 w-3 mr-1" /> Hot
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline" /> {event.time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">View Odds</Button>
                        <Button size="sm" className="flex-1">Quick Bet</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Upcoming Events</p>
                <p>Check back soon for new betting opportunities!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Rewards tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Rewards Progress</CardTitle>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <CardDescription>
                Complete actions to earn rewards and unlock bonuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-2 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium">Daily Login Streak</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">3 days in a row</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600 dark:text-green-400">+50 points</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
                    </div>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-2 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Gift className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">Complete Profile</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">2/5 steps completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600 dark:text-blue-400">+100 points</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                    </div>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-2 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium">Place First Bet</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Place any bet to earn</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-purple-600 dark:text-purple-400">+200 points</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                    </div>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Total Reward Points</div>
                    <div className="text-2xl font-bold">325</div>
                  </div>
                  <Button>
                    View All Rewards <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WelcomeDashboard;