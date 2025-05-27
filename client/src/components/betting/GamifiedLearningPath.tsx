import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Trophy, Target, BookOpen, TrendingUp, Users, Shield, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  completed: boolean;
  locked: boolean;
  progress: number;
}

interface UserProgress {
  level: number;
  weparlayCash: number;
  cashToNextLevel: number;
  completedModules: string[];
  badges: string[];
  streak: number;
  totalBetsPlaced: number;
  winRate: number;
}

export default function GamifiedLearningPath() {
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    weparlayCash: 1000, // Starting bonus
    cashToNextLevel: 500,
    completedModules: [],
    badges: ['newcomer'],
    streak: 0,
    totalBetsPlaced: 0,
    winRate: 0
  });

  const learningModules: LearningModule[] = [
    {
      id: 'basics',
      title: 'Betting Fundamentals 🎯',
      description: 'Master the essentials: odds, terminology, and your first bet',
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      difficulty: 'Beginner',
      xpReward: 250, // WeParlay Cash reward
      completed: false,
      locked: false,
      progress: 0
    },
    {
      id: 'bankroll',
      title: 'Smart Money Management 💰',
      description: 'Learn responsible betting and bankroll strategies',
      icon: <Shield className="w-6 h-6 text-green-500" />,
      difficulty: 'Beginner',
      xpReward: 500, // WeParlay Cash reward
      completed: false,
      locked: true,
      progress: 0
    },
    {
      id: 'analysis',
      title: 'Sports Analysis Pro 📊',
      description: 'Develop analytical skills to spot value bets',
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      difficulty: 'Intermediate',
      xpReward: 750, // WeParlay Cash reward
      completed: false,
      locked: true,
      progress: 0
    },
    {
      id: 'advanced',
      title: 'Elite Strategies 🏆',
      description: 'Master advanced techniques and portfolio management',
      icon: <Trophy className="w-6 h-6 text-gold-500" />,
      difficulty: 'Advanced',
      xpReward: 1000, // WeParlay Cash reward
      completed: false,
      locked: true,
      progress: 0
    }
  ];

  const achievements = [
    { id: 'first-bet', name: 'First Bet Placed', icon: '🎯', unlocked: userProgress.totalBetsPlaced > 0 },
    { id: 'streak-7', name: '7-Day Learning Streak', icon: '🔥', unlocked: userProgress.streak >= 7 },
    { id: 'level-5', name: 'Reached Level 5', icon: '⭐', unlocked: userProgress.level >= 5 },
    { id: 'win-rate', name: '70% Win Rate', icon: '💎', unlocked: userProgress.winRate >= 0.7 },
  ];

  const startModule = (module: LearningModule) => {
    if (module.locked) {
      toast({
        title: "Module Locked 🔒",
        description: "Complete previous modules to unlock this one!",
        variant: "destructive"
      });
      return;
    }

    setSelectedModule(module);
    toast({
      title: `Starting ${module.title}! 🚀`,
      description: `Get ready to earn ${module.xpReward} XP!`,
    });
  };

  const completeModule = (moduleId: string) => {
    const module = learningModules.find(m => m.id === moduleId);
    if (!module) return;

    setUserProgress(prev => {
      const newCash = prev.weparlayCash + module.xpReward;
      const newLevel = Math.floor(newCash / 1000) + 1;
      
      return {
        ...prev,
        weparlayCash: newCash,
        level: newLevel,
        completedModules: [...prev.completedModules, moduleId],
        streak: prev.streak + 1
      };
    });

    // Unlock next module
    const currentIndex = learningModules.findIndex(m => m.id === moduleId);
    if (currentIndex < learningModules.length - 1) {
      learningModules[currentIndex + 1].locked = false;
    }

    toast({
      title: "Module Mastered! 🎉",
      description: `+$${module.xpReward} WeParlay Cash earned! You're becoming a betting expert!`,
    });

    setSelectedModule(null);
  };

  const getProgressPercentage = () => {
    return ((userProgress.weparlayCash % 1000) / 1000) * 100;
  };

  const getLevelProgress = () => {
    const completedModules = userProgress.completedModules.length;
    const totalModules = learningModules.length;
    return (completedModules / totalModules) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              WeParlay Betting Academy 🎓
            </h1>
            <p className="text-gray-600 text-lg">Master sports betting with our gamified learning experience</p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">Level {userProgress.level}</div>
                <div className="text-sm opacity-90">${userProgress.weparlayCash} WeParlay Cash</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userProgress.completedModules.length}/4</div>
                <div className="text-sm opacity-90">Modules Completed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userProgress.streak}</div>
                <div className="text-sm opacity-90">Day Streak 🔥</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userProgress.badges.length}</div>
                <div className="text-sm opacity-90">Badges Earned</div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Progress to Level {userProgress.level + 1}</span>
                <span className="text-sm text-gray-500">{getProgressPercentage()}% Complete</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-4 mb-4" />
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Overall Academy Progress</span>
                <span>{getLevelProgress().toFixed(0)}% Complete</span>
              </div>
              <Progress value={getLevelProgress()} className="h-2 mt-1" />
            </CardContent>
          </Card>
        </div>

        {/* Learning Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {learningModules.map((module, index) => (
            <Card 
              key={module.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                module.locked ? 'opacity-60 cursor-not-allowed' : ''
              } ${module.completed ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
              onClick={() => startModule(module)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                    {module.icon}
                  </div>
                  {module.completed && (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                  {module.locked && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      🔒
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    variant={module.difficulty === 'Beginner' ? 'default' : 
                           module.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                  >
                    {module.difficulty}
                  </Badge>
                  <div className="flex items-center text-sm font-semibold text-blue-600">
                    <Star className="w-4 h-4 mr-1" />
                    +{module.xpReward} XP
                  </div>
                </div>

                {module.progress > 0 && (
                  <div className="mb-2">
                    <Progress value={module.progress} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{module.progress}% Complete</div>
                  </div>
                )}

                <Button 
                  className={`w-full ${module.completed ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  disabled={module.locked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (module.completed) {
                      toast({
                        title: "Already Mastered! ✨",
                        description: "You've completed this module. Great job!",
                      });
                    } else {
                      startModule(module);
                    }
                  }}
                >
                  {module.completed ? 'Completed ✓' : module.locked ? 'Locked 🔒' : 'Start Learning'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border text-center transition-all duration-200 ${
                    achievement.unlocked 
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-medium">{achievement.name}</div>
                  {achievement.unlocked && (
                    <div className="text-xs mt-1 text-green-600">Unlocked!</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Module Detail */}
        {selectedModule && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center space-x-3">
                {selectedModule.icon}
                <span>{selectedModule.title}</span>
              </CardTitle>
              <p className="text-gray-600 text-lg">{selectedModule.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Module Content:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Interactive lessons with real examples</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Practice exercises with virtual money</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Quiz to test your knowledge</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    size="lg" 
                    className="flex-1"
                    onClick={() => completeModule(selectedModule.id)}
                  >
                    Complete Module (+{selectedModule.xpReward} XP)
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setSelectedModule(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}