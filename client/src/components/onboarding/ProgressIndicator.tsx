import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingContext } from './OnboardingProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Award,
  ChevronDown,
  ChevronUp,
  Star,
  Trophy,
  XCircle,
  Flame
} from 'lucide-react';

const ProgressIndicator: React.FC = () => {
  const { currentLevel, xp, xpForNextLevel, achievements } = useOnboardingContext();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.round((xp / xpForNextLevel) * 100));

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="w-64 shadow-lg border-green-200 dark:border-green-900">
        <CardHeader className="pb-2 pt-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              <CardTitle className="text-sm">Level {currentLevel}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex justify-between text-xs mt-1 mb-1">
            <span>Progress to Level {currentLevel + 1}</span>
            <span className="font-medium">{xp}/{xpForNextLevel} XP</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="px-3 py-2">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium flex items-center mb-2">
                      <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                      Recent Achievements
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {achievements.length > 0 ? (
                        achievements.slice(0, 5).map((achievement, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            {achievement}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Complete tasks to earn achievements</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium flex items-center mb-2">
                      <Star className="h-4 w-4 mr-1 text-blue-500" />
                      Upcoming Rewards
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 dark:text-gray-300">Free Bet Token</span>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                          Level {currentLevel + 1}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 dark:text-gray-300">Odds Boost</span>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                          Level {currentLevel + 2}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        <CardFooter className="pt-0 pb-3 px-3">
          <div className="w-full flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-900/20 p-0"
            >
              View All
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-green-600 dark:text-green-300">{progressPercentage}%</span> to next level
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProgressIndicator;