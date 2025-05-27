import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, TrendingUp, Target, Award, Users, BarChart3 } from 'lucide-react';

export default function BettingAcademy() {
  const [selectedModule, setSelectedModule] = useState('fundamentals');

  // Fetch real sports data for educational content
  const { data: sportsData } = useQuery({
    queryKey: ['/api/sports/comprehensive-coverage'],
  });

  // Fetch live market data for examples
  const { data: liveData } = useQuery({
    queryKey: ['/api/events/enhanced-live'],
  });

  const learningModules = [
    {
      id: 'fundamentals',
      title: 'Betting Fundamentals',
      description: 'Master the basics of sports betting',
      icon: BookOpen,
      lessons: [
        'Understanding Odds & Probability',
        'Reading Betting Lines',
        'Bankroll Management',
        'Sports Betting Terminology'
      ],
      progress: 75
    },
    {
      id: 'strategies',
      title: 'Advanced Strategies',
      description: 'Professional betting techniques',
      icon: TrendingUp,
      lessons: [
        'Value Betting Identification',
        'Line Shopping Techniques',
        'Live Betting Strategies',
        'Arbitrage Opportunities'
      ],
      progress: 45
    },
    {
      id: 'analytics',
      title: 'Data Analytics',
      description: 'Using data to make informed bets',
      icon: BarChart3,
      lessons: [
        'Statistical Analysis',
        'Team Performance Metrics',
        'Weather Impact Studies',
        'Historical Trends'
      ],
      progress: 30
    },
    {
      id: 'psychology',
      title: 'Betting Psychology',
      description: 'Mental aspects of successful betting',
      icon: Target,
      lessons: [
        'Emotional Control',
        'Avoiding Tilt',
        'Decision Making Under Pressure',
        'Long-term Thinking'
      ],
      progress: 60
    }
  ];

  const achievements = [
    { title: 'First Bet Placed', description: 'Completed your first wager', earned: true },
    { title: 'Fundamentals Graduate', description: 'Completed betting basics', earned: true },
    { title: 'Value Hunter', description: 'Identified 10 value bets', earned: false },
    { title: 'Data Analyst', description: 'Used analytics for 50 bets', earned: false },
    { title: 'Bankroll Master', description: 'Maintained positive ROI for 30 days', earned: false }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          WeParlay Betting Academy
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Master the art of sports betting with our comprehensive learning platform
        </p>
        
        {/* Live Coverage Stats */}
        {sportsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {sportsData.total_sports || 0}
                </div>
                <div className="text-sm text-gray-600">Sports Covered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {sportsData.total_live_matches || 0}
                </div>
                <div className="text-sm text-gray-600">Live Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {sportsData.api_sources || 0}
                </div>
                <div className="text-sm text-gray-600">Data Sources</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {sportsData.total_upcoming || 0}
                </div>
                <div className="text-sm text-gray-600">Upcoming Events</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="learn" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learn">Learning Modules</TabsTrigger>
          <TabsTrigger value="practice">Live Practice</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="learn" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningModules.map((module) => {
              const IconComponent = module.icon;
              return (
                <Card key={module.id} className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedModule === module.id ? 'ring-2 ring-blue-500' : ''
                }`} onClick={() => setSelectedModule(module.id)}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium">{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                      <div className="space-y-2">
                        {module.lessons.map((lesson, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              index < Math.floor(module.lessons.length * module.progress / 100)
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                            }`} />
                            <span className="text-sm">{lesson}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span>Live Market Analysis Practice</span>
              </CardTitle>
              <CardDescription>
                Practice analyzing real market data with live events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {liveData && liveData.total_opportunities > 0 ? (
                <div className="space-y-4">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      {liveData.total_opportunities} Live Opportunities Available
                    </h3>
                    <p className="text-green-600 mb-4">
                      Perfect for practicing live betting analysis
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Start Practice Session
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Available Sources</h4>
                      <div className="space-y-1">
                        {liveData.sources?.map((source: string, index: number) => (
                          <Badge key={index} variant="outline">{source}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Practice Focus</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Odds comparison across sources</li>
                        <li>• Line movement tracking</li>
                        <li>• Value identification</li>
                        <li>• Risk assessment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Live Events Currently
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Check back during peak sports hours for live practice opportunities
                  </p>
                  <Button variant="outline">
                    View Upcoming Events
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`${
                achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Award className={`h-8 w-8 ${
                      achievement.earned ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <Badge variant={achievement.earned ? 'default' : 'secondary'}>
                    {achievement.earned ? 'Earned' : 'Locked'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}