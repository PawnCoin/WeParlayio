import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trophy, Zap, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  explanation?: string;
}

interface TriviaProps {
  onClose?: () => void;
  onComplete?: (score: number, total: number) => void;
}

const STORAGE_KEY = 'weparlay_trivia_stats';

const SportsTrivia: React.FC<TriviaProps> = ({ onClose, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load saved trivia stats
  useEffect(() => {
    const savedStats = localStorage.getItem(STORAGE_KEY);
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setBestStreak(stats.bestStreak || 0);
    }
  }, []);

  // Initialize with questions
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // For demo, we're using a static set of sports trivia questions
      const triviaQuestions: Question[] = [
        {
          id: 1,
          category: 'Basketball',
          difficulty: 'easy',
          question: 'Which NBA player holds the record for most points scored in a single game?',
          correctAnswer: 'Wilt Chamberlain',
          incorrectAnswers: ['Kobe Bryant', 'Michael Jordan', 'LeBron James'],
          explanation: 'Wilt Chamberlain scored 100 points for the Philadelphia Warriors against the New York Knicks on March 2, 1962.'
        },
        {
          id: 2,
          category: 'Football',
          difficulty: 'medium',
          question: 'Which team has won the most Super Bowl championships?',
          correctAnswer: 'New England Patriots',
          incorrectAnswers: ['Pittsburgh Steelers', 'Dallas Cowboys', 'San Francisco 49ers'],
          explanation: 'The New England Patriots and Pittsburgh Steelers are tied with 6 Super Bowl wins each, though the Patriots have appeared in more Super Bowls.'
        },
        {
          id: 3,
          category: 'Baseball',
          difficulty: 'medium',
          question: 'Who holds the MLB record for most career home runs?',
          correctAnswer: 'Barry Bonds',
          incorrectAnswers: ['Hank Aaron', 'Babe Ruth', 'Alex Rodriguez'],
          explanation: 'Barry Bonds hit 762 home runs during his career, surpassing Hank Aaron\'s 755.'
        },
        {
          id: 4,
          category: 'Tennis',
          difficulty: 'hard',
          question: 'Which male tennis player has won the most Grand Slam singles titles?',
          correctAnswer: 'Novak Djokovic',
          incorrectAnswers: ['Rafael Nadal', 'Roger Federer', 'Pete Sampras'],
          explanation: 'As of 2023, Novak Djokovic has won 24 Grand Slam singles titles, the most in men\'s tennis history.'
        },
        {
          id: 5,
          category: 'Soccer',
          difficulty: 'medium',
          question: 'Which country has won the most FIFA World Cup tournaments?',
          correctAnswer: 'Brazil',
          incorrectAnswers: ['Germany', 'Italy', 'Argentina'],
          explanation: 'Brazil has won the FIFA World Cup 5 times (1958, 1962, 1970, 1994, and 2002).'
        },
        {
          id: 6,
          category: 'Hockey',
          difficulty: 'medium',
          question: 'Which NHL team has won the most Stanley Cup championships?',
          correctAnswer: 'Montreal Canadiens',
          incorrectAnswers: ['Toronto Maple Leafs', 'Detroit Red Wings', 'Boston Bruins'],
          explanation: 'The Montreal Canadiens have won the Stanley Cup 24 times, more than any other team.'
        },
        {
          id: 7,
          category: 'Boxing',
          difficulty: 'hard',
          question: 'Who is the only boxer to finish his career as a heavyweight champion with an undefeated record?',
          correctAnswer: 'Rocky Marciano',
          incorrectAnswers: ['Muhammad Ali', 'Mike Tyson', 'Floyd Mayweather Jr.'],
          explanation: 'Rocky Marciano retired with a record of 49-0, the only heavyweight champion to retire without a loss.'
        },
        {
          id: 8,
          category: 'Golf',
          difficulty: 'medium',
          question: 'Which golfer has won the most major championships?',
          correctAnswer: 'Jack Nicklaus',
          incorrectAnswers: ['Tiger Woods', 'Walter Hagen', 'Ben Hogan'],
          explanation: 'Jack Nicklaus has won 18 major championships, the most in golf history.'
        },
        {
          id: 9,
          category: 'Olympics',
          difficulty: 'hard',
          question: 'Which athlete has won the most Olympic gold medals?',
          correctAnswer: 'Michael Phelps',
          incorrectAnswers: ['Usain Bolt', 'Carl Lewis', 'Larisa Latynina'],
          explanation: 'Michael Phelps has won 23 Olympic gold medals, the most by any athlete in Olympic history.'
        },
        {
          id: 10,
          category: 'NASCAR',
          difficulty: 'medium',
          question: 'Which NASCAR driver has won the most Cup Series championships?',
          correctAnswer: 'Richard Petty',
          incorrectAnswers: ['Jimmie Johnson', 'Dale Earnhardt', 'Jeff Gordon'],
          explanation: 'Richard Petty and Dale Earnhardt are tied with Jimmie Johnson for the most NASCAR Cup Series championships with 7 each.'
        }
      ];
      
      // Shuffle questions for random order
      const shuffled = [...triviaQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      shuffleAnswersForQuestion(shuffled[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error loading trivia questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trivia questions. Please try again.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Shuffle answers for the current question
  const shuffleAnswersForQuestion = (question: Question) => {
    if (!question) return;
    const allAnswers = [question.correctAnswer, ...question.incorrectAnswers];
    setShuffledAnswers(allAnswers.sort(() => Math.random() - 0.5));
  };

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || gameCompleted || loading) return;
    
    if (timeLeft <= 0) {
      setIsTimerActive(false);
      setShowAnswer(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, isTimerActive, gameCompleted, loading]);

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (showAnswer || !isTimerActive) return;
    
    setSelectedAnswer(answer);
    setShowAnswer(true);
    setIsTimerActive(false);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      setBestStreak(prev => Math.max(prev, streak + 1));
      
      // Save best streak
      const savedStats = localStorage.getItem(STORAGE_KEY);
      const stats = savedStats ? JSON.parse(savedStats) : {};
      stats.bestStreak = Math.max(stats.bestStreak || 0, streak + 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      
      // Play confetti animation for correct answers
      if (typeof window !== 'undefined') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      setStreak(0);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setTimeLeft(15);
      setIsTimerActive(true);
      shuffleAnswersForQuestion(questions[currentQuestionIndex + 1]);
    } else {
      setGameCompleted(true);
      if (onComplete) {
        onComplete(correctAnswers, questions.length);
      }
    }
  };

  // Restart the game
  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowAnswer(false);
    setTimeLeft(15);
    setIsTimerActive(true);
    setGameCompleted(false);
    setStreak(0);
    loadQuestions();
  };

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  // Calculate score percentage
  const scorePercentage = questions.length > 0 
    ? Math.round((correctAnswers / questions.length) * 100) 
    : 0;

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg">Loading sports trivia...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Game completed view
  if (gameCompleted) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
            Trivia Complete!
          </CardTitle>
          <CardDescription className="text-center text-lg">
            You scored {correctAnswers} out of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{scorePercentage}%</p>
              <Progress value={scorePercentage} className="h-2 mt-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border rounded-lg p-3">
                <p className="text-sm text-gray-500">Current Streak</p>
                <p className="text-xl font-semibold">{streak}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm text-gray-500">Best Streak</p>
                <p className="text-xl font-semibold">{bestStreak}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="font-medium mb-2">How did you do?</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {scorePercentage >= 80 ? '🏆 Amazing! You\'re a sports trivia genius!' :
                 scorePercentage >= 60 ? '👍 Good job! Your sports knowledge is impressive.' :
                 scorePercentage >= 40 ? '🤔 Not bad! Keep practicing your sports facts.' :
                 '📚 Keep learning! Sports trivia takes practice.'}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={restartGame} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Play Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Question view
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1 text-xs">
              {currentQuestionIndex + 1} / {questions.length}
            </Badge>
            {currentQuestion && (
              <Badge className={`${getDifficultyColor(currentQuestion.difficulty)} text-xs`}>
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeLeft}s
          </Badge>
        </div>
        {currentQuestion && (
          <>
            <Badge variant="secondary" className="w-fit my-2">
              {currentQuestion.category}
            </Badge>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {shuffledAnswers.map((answer, index) => {
            const isCorrect = answer === currentQuestion?.correctAnswer;
            const isSelected = answer === selectedAnswer;
            let buttonVariant: 'default' | 'outline' | 'secondary' = 'outline';
            let buttonClasses = '';
            
            if (showAnswer) {
              if (isCorrect) {
                buttonVariant = 'default';
                buttonClasses = 'bg-green-600 hover:bg-green-700 text-white border-green-600';
              } else if (isSelected) {
                buttonVariant = 'outline';
                buttonClasses = 'bg-red-100 dark:bg-red-900/20 border-red-600 text-red-600 dark:text-red-400';
              }
            } else if (isSelected) {
              buttonVariant = 'secondary';
            }
            
            return (
              <Button
                key={index}
                variant={buttonVariant}
                className={`w-full justify-start text-left p-4 h-auto ${buttonClasses}`}
                onClick={() => handleAnswerSelect(answer)}
                disabled={showAnswer}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1">{answer}</div>
                  {showAnswer && isCorrect && <Check className="h-5 w-5 text-white" />}
                  {showAnswer && isSelected && !isCorrect && <X className="h-5 w-5 text-red-600 dark:text-red-400" />}
                </div>
              </Button>
            );
          })}
        </div>
        
        {showAnswer && currentQuestion?.explanation && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm font-medium mb-1">Explanation:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">Streak: {streak}</span>
        </div>
        
        {showAnswer ? (
          <Button onClick={nextQuestion} className="gap-1">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="text-sm text-gray-500">Select an answer</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SportsTrivia;