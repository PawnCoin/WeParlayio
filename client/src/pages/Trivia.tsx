import React, { useState } from 'react';
import SportsTrivia from '@/components/trivia/SportsTrivia';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Trivia = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const handleTriviaComplete = (score: number, total: number) => {
    // Award virtual currency for good scores
    if (score > Math.floor(total * 0.7)) {
      toast({
        title: "WeParlay Cash Earned!",
        description: `You earned 50 WeParlay Cash for your trivia performance!`,
        duration: 5000,
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {!isPlaying ? (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Brain className="h-16 w-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold mb-4">WeParlay Sports Trivia</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Test your knowledge of sports facts and history with our interactive trivia game. 
              Earn WeParlay Cash rewards for high scores!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center border border-gray-200 dark:border-gray-700">
              <Trophy className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
              <h3 className="text-lg font-semibold mb-2">Win Rewards</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Score highly and earn WeParlay Cash to use for betting
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center border border-gray-200 dark:border-gray-700">
              <Award className="h-8 w-8 mx-auto mb-3 text-purple-500" />
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Keep track of your streaks and best scores over time
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center border border-gray-200 dark:border-gray-700">
              <Brain className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">Learn Facts</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Expand your sports knowledge with interesting facts and explanations
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => setIsPlaying(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg transition-transform hover:scale-105"
            >
              Start Trivia Game
            </Button>
          </div>
        </div>
      ) : (
        <SportsTrivia 
          onClose={() => setIsPlaying(false)}
          onComplete={handleTriviaComplete}
        />
      )}
    </div>
  );
};

export default Trivia;