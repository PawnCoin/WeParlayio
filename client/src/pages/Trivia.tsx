import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Brain, Clock, Trophy, Zap, Star, Target, CheckCircle, XCircle } from "lucide-react";
import VipGuard from "@/components/access/VipGuard";

export default function Trivia() {
  return (
    <VipGuard 
      requiredTier="silver" 
      feature="Sports Trivia Hub"
    >
      <TriviaContent />
    </VipGuard>
  );
}

function TriviaContent() {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const triviaQuestions = [
    {
      question: "Which team won the 2023 Super Bowl?",
      answers: ["Kansas City Chiefs", "Philadelphia Eagles", "Buffalo Bills", "San Francisco 49ers"],
      correct: 0,
      category: "NFL"
    },
    {
      question: "Who holds the record for most NBA championships as a player?",
      answers: ["Michael Jordan", "Bill Russell", "LeBron James", "Kobe Bryant"],
      correct: 1,
      category: "NBA"
    },
    {
      question: "Which country won the 2022 FIFA World Cup?",
      answers: ["Brazil", "France", "Argentina", "Germany"],
      correct: 2,
      category: "Soccer"
    },
    {
      question: "What is the maximum score possible in ten-pin bowling?",
      answers: ["200", "250", "300", "350"],
      correct: 2,
      category: "Bowling"
    },
    {
      question: "Which tennis tournament is played on clay courts?",
      answers: ["Wimbledon", "US Open", "Australian Open", "French Open"],
      correct: 3,
      category: "Tennis"
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameActive) {
      handleTimeout();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive, showResult]);

  const startGame = () => {
    setGameActive(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleTimeout = () => {
    setShowResult(true);
    setTimeout(() => {
      if (currentQuestion < triviaQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        endGame();
      }
    }, 2000);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !gameActive) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === triviaQuestions[currentQuestion].correct) {
      setScore(score + 1);
      toast({
        title: "Correct!",
        description: "Great job! +1 point",
      });
    } else {
      toast({
        title: "Incorrect",
        description: "Better luck next time!",
        variant: "destructive"
      });
    }

    setTimeout(() => {
      if (currentQuestion < triviaQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        endGame();
      }
    }, 2000);
  };

  const endGame = () => {
    setGameActive(false);
    const percentage = (score / triviaQuestions.length) * 100;
    
    toast({
      title: "Game Complete!",
      description: `Final Score: ${score}/${triviaQuestions.length} (${percentage.toFixed(1)}%)`,
    });
  };

  const getScoreColor = () => {
    const percentage = (score / triviaQuestions.length) * 100;
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-blue-400" />
            Sports Trivia Challenge
            <Trophy className="h-10 w-10 text-yellow-400" />
          </h1>
          <p className="text-gray-300 text-lg">
            Test your sports knowledge and compete for high scores
          </p>
        </div>

        {!gameActive ? (
          /* Start Screen */
          <div className="text-center space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Ready to Play?</CardTitle>
                <CardDescription className="text-gray-300">
                  Answer {triviaQuestions.length} sports questions as quickly as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-4 bg-blue-900/50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">30 seconds</div>
                    <div className="text-gray-400">per question</div>
                  </div>
                  <div className="text-center p-4 bg-purple-900/50 rounded-lg">
                    <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">{triviaQuestions.length} questions</div>
                    <div className="text-gray-400">multiple choice</div>
                  </div>
                </div>
                
                <Button 
                  onClick={startGame}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  size="lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Start Trivia Challenge
                </Button>
              </CardContent>
            </Card>

            {/* High Scores */}
            <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "SportsExpert", score: "5/5", time: "2:15" },
                    { name: "TriviaMaster", score: "4/5", time: "2:45" },
                    { name: "QuizChamp", score: "4/5", time: "3:12" }
                  ].map((player, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="text-white">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-green-400 font-semibold">{player.score}</span>
                        <span className="text-gray-400 text-sm">{player.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Game Screen */
          <div className="space-y-6">
            {/* Progress and Stats */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-600 text-white">
                  Question {currentQuestion + 1}/{triviaQuestions.length}
                </Badge>
                <Badge className={`${getScoreColor()} bg-slate-800`}>
                  Score: {score}/{triviaQuestions.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <Progress value={(timeLeft / 30) * 100} className="h-2" />

            {/* Question Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                    {triviaQuestions[currentQuestion].category}
                  </Badge>
                </div>
                <CardTitle className="text-white text-xl leading-relaxed">
                  {triviaQuestions[currentQuestion].question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {triviaQuestions[currentQuestion].answers.map((answer, index) => {
                    let buttonClass = "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600";
                    
                    if (showResult && selectedAnswer !== null) {
                      if (index === triviaQuestions[currentQuestion].correct) {
                        buttonClass = "bg-green-600 hover:bg-green-600 text-white border border-green-500";
                      } else if (index === selectedAnswer) {
                        buttonClass = "bg-red-600 hover:bg-red-600 text-white border border-red-500";
                      }
                    }

                    return (
                      <Button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null || !gameActive}
                        className={`${buttonClass} p-4 h-auto text-left justify-start relative`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{answer}</span>
                          {showResult && index === triviaQuestions[currentQuestion].correct && (
                            <CheckCircle className="h-5 w-5 text-green-400 ml-auto" />
                          )}
                          {showResult && index === selectedAnswer && index !== triviaQuestions[currentQuestion].correct && (
                            <XCircle className="h-5 w-5 text-red-400 ml-auto" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Final Score */}
            {!gameActive && (
              <Card className="bg-slate-800/50 border-slate-700 text-center">
                <CardContent className="py-8">
                  <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Game Complete!</h2>
                  <div className={`text-3xl font-bold ${getScoreColor()} mb-4`}>
                    {score}/{triviaQuestions.length}
                  </div>
                  <p className="text-gray-300 mb-6">
                    {score === triviaQuestions.length ? "Perfect score! Amazing!" :
                     score >= triviaQuestions.length * 0.8 ? "Excellent work!" :
                     score >= triviaQuestions.length * 0.6 ? "Good job!" :
                     "Keep practicing!"}
                  </p>
                  <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700">
                    Play Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}