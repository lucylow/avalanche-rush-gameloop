import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Code,
  Lightbulb,
  BookOpen,
  Target,
  Star,
  Trophy,
  Clock
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  type: 'concept' | 'interactive' | 'quiz' | 'demo';
  content: string;
  codeExample?: string;
  interactiveElement?: React.ReactNode;
  quizQuestion?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  expectedAction?: string;
  isCompleted: boolean;
}

interface InteractiveTutorialProps {
  tutorialId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  steps: TutorialStep[];
  onComplete: (score: number, timeSpent: number) => void;
  onProgress: (currentStep: number, totalSteps: number) => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  tutorialId,
  title,
  description,
  difficulty,
  estimatedTime,
  steps,
  onComplete,
  onProgress
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (isPlaying && !startTime) {
      setStartTime(Date.now());
    }
  }, [isPlaying, startTime]);

  useEffect(() => {
    onProgress(currentStep, steps.length);
  }, [currentStep, steps.length, onProgress]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowExplanation(false);
    } else {
      const timeSpent = startTime ? (Date.now() - startTime) / 1000 : 0;
      onComplete(score, timeSpent);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowExplanation(false);
    }
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    const step = steps.find(s => s.quizQuestion && s.id === questionId);
    if (step?.quizQuestion?.correctAnswer === answerIndex) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'concept':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Concept Learning</span>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">{currentStepData.content}</p>
            </div>
            {currentStepData.codeExample && (
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{currentStepData.codeExample}</code>
                </pre>
              </div>
            )}
          </motion.div>
        );

      case 'interactive':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Interactive Exercise</span>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">{currentStepData.content}</p>
            </div>
            {currentStepData.expectedAction && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Expected Action:</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">{currentStepData.expectedAction}</p>
              </div>
            )}
            {currentStepData.interactiveElement}
          </motion.div>
        );

      case 'quiz':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Knowledge Check</span>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">{currentStepData.quizQuestion?.question}</h3>
              <div className="space-y-3">
                {currentStepData.quizQuestion?.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuizAnswer(currentStepData.id, index)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      quizAnswers[currentStepData.id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        quizAnswers[currentStepData.id] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`} />
                      <span className="text-gray-700">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              {showExplanation && currentStepData.quizQuestion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <p className="text-sm text-gray-600">
                    <strong>Explanation:</strong> {currentStepData.quizQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 'demo':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Play className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Live Demo</span>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">{currentStepData.content}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
                <div className="text-center">
                  <Play className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-400">Interactive Demo Coming Soon</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={`${getDifficultyColor(difficulty)} text-white`}>
              {difficulty}
            </Badge>
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{estimatedTime} min</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>Score: {score}/{steps.filter(s => s.type === 'quiz').length}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-lg">{currentStepData.title}</span>
            {currentStepData.isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>
        </div>

        <Button
          onClick={handleNext}
          className="flex items-center space-x-2"
          disabled={currentStepData.type === 'quiz' && !quizAnswers[currentStepData.id] && !showExplanation}
        >
          <span>{currentStep === steps.length - 1 ? 'Complete' : 'Next'}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InteractiveTutorial;
