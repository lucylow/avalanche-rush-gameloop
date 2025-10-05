import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  Star,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Target,
  Lightbulb,
  BookOpen,
  Award,
  TrendingUp,
  Brain,
  Zap
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'code' | 'scenario';
  options?: string[];
  correctAnswer: number | string | boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
  timeLimit?: number; // in seconds
  codeExample?: string;
  hint?: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  accuracy: number;
  grade: string;
  feedback: string;
  improvements: string[];
}

interface QuizSystemProps {
  questions: QuizQuestion[];
  title: string;
  description: string;
  timeLimit?: number; // total time limit in minutes
  passingScore?: number; // percentage needed to pass
  onComplete: (result: QuizResult) => void;
  onRetry: () => void;
}

const QuizSystem: React.FC<QuizSystemProps> = ({
  questions,
  title,
  description,
  timeLimit,
  passingScore = 70,
  onComplete,
  onRetry
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);
  const [startTime, setStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleComplete();
    }
  }, [timeRemaining]);

  const handleAnswerSelect = (answer: string | number) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({ ...prev, [currentQ.id]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[questions[currentQuestion + 1].id]);
      setShowExplanation(false);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[questions[currentQuestion - 1].id]);
      setShowExplanation(false);
    }
  };

  const handleComplete = () => {
    const endTime = Date.now();
    const timeSpent = (endTime - startTime) / 1000;
    
    let correctAnswers = 0;
    const improvements: string[] = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);
      if (isCorrect) {
        correctAnswers++;
      } else {
        improvements.push(`Review: ${question.category} - ${question.question}`);
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const grade = getGrade(score);
    const feedback = getFeedback(score);

    const result: QuizResult = {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      wrongAnswers: questions.length - correctAnswers,
      timeSpent,
      accuracy: score,
      grade,
      feedback,
      improvements
    };

    setQuizResult(result);
    setShowResult(true);
    onComplete(result);
  };

  const checkAnswer = (question: QuizQuestion, userAnswer: string | number): boolean => {
    switch (question.type) {
      case 'multiple-choice':
        return userAnswer === question.correctAnswer;
      case 'true-false':
        return userAnswer === question.correctAnswer;
      case 'code':
        return userAnswer === question.correctAnswer;
      case 'scenario':
        return userAnswer === question.correctAnswer;
      default:
        return false;
    }
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getFeedback = (score: number): string => {
    if (score >= 90) return "Excellent! You have a strong understanding of the material.";
    if (score >= 80) return "Great job! You have a good grasp of the concepts.";
    if (score >= 70) return "Good work! Consider reviewing some topics for improvement.";
    if (score >= 60) return "Not bad, but there's room for improvement. Review the material.";
    return "Keep studying! Review the concepts and try again.";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResult && quizResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto p-6"
      >
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {quizResult.score >= passingScore ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <Trophy className="h-10 w-10 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center"
                >
                  <Target className="h-10 w-10 text-yellow-500" />
                </motion.div>
              )}
            </div>
            <CardTitle className="text-3xl mb-2">
              {quizResult.score >= passingScore ? 'Congratulations!' : 'Keep Learning!'}
            </CardTitle>
            <div className="text-6xl font-bold mb-4">
              {quizResult.score}%
            </div>
            <Badge className={`${getDifficultyColor(quizResult.score >= passingScore ? 'easy' : 'medium')} text-white text-lg px-4 py-2`}>
              Grade: {quizResult.grade}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-600">{quizResult.feedback}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{quizResult.correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{quizResult.wrongAnswers}</div>
                <div className="text-sm text-gray-600">Wrong</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatTime(Math.round(quizResult.timeSpent))}</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{quizResult.accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>

            {quizResult.improvements.length > 0 && (
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-3">Areas to Review:</h3>
                <ul className="space-y-2">
                  {quizResult.improvements.slice(0, 5).map((improvement, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button onClick={onRetry} variant="outline" className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Retry Quiz</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4" />
                <span>Continue Learning</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Badge className={`${getDifficultyColor(currentQ.difficulty)} text-white`}>
              {currentQ.difficulty}
            </Badge>
            <Badge variant="outline">{currentQ.category}</Badge>
            <div className="flex items-center space-x-2 text-gray-500">
              <Brain className="h-4 w-4" />
              <span>{currentQ.points} points</span>
            </div>
          </div>
          
          {timeRemaining !== null && (
            <div className="flex items-center space-x-2 text-red-600">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>

      {/* Question */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-lg">{currentQ.question}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQ.codeExample && (
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{currentQ.codeExample}</code>
                </pre>
              </div>
            )}

            {currentQ.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQ.options?.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`} />
                      <span className="text-gray-700">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {currentQ.type === 'true-false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`} />
                      <span className="text-gray-700">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {currentQ.hint && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Hint:</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">{currentQ.hint}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestion
                  ? 'bg-blue-500'
                  : answers[questions[index].id] !== undefined
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="flex items-center space-x-2"
        >
          <span>{currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuizSystem;
