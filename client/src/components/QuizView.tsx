import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Lightbulb, Clock, Trophy } from 'lucide-react';
import type { QuizQuestion, Student, SubmitQuizAnswerInput } from '../../../server/src/schema';

interface QuizViewProps {
  questions: QuizQuestion[];
  student: Student;
  onAnswerSubmit: (input: SubmitQuizAnswerInput) => Promise<void>;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted: boolean;
}

interface QuizAnswer {
  questionId: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
}

export function QuizView({ questions, student, onAnswerSubmit, onComplete, isCompleted }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | ''>('');
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(isCompleted);

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const correctAnswers = answers.filter((answer: QuizAnswer) => answer.isCorrect).length;

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const handleAnswerSelection = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    // Submit to backend
    try {
      await onAnswerSubmit({
        student_id: student.id,
        question_id: currentQuestion.id,
        selected_answer: selectedAnswer,
        attempt_type: 'quiz'
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }

    // Update local state
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswer,
      isCorrect: isCorrect
    };

    setAnswers((prev: QuizAnswer[]) => [...prev, newAnswer]);
    setIsAnswerSubmitted(true);
    setShowExplanation(true);

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    onComplete(correctAnswers, questions.length);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  if (questions.length === 0) {
    return (
      <Card className="border-2 border-green-200">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Loading quiz questions...</p>
            <p className="text-sm mt-2">🧩 Preparing your Set Theory challenges!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizFinished) {
    const timeElapsed = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60);
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-800">
            🎉 Quiz Complete!
          </CardTitle>
          <CardDescription className="text-green-700 text-lg">
            Great job, {student.name}! You've finished the practice quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{correctAnswers}</div>
              <div className="text-sm text-blue-600">Correct Answers</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{percentage}%</div>
              <div className="text-sm text-purple-600">Score</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{timeElapsed}</div>
              <div className="text-sm text-orange-600">Minutes</div>
            </div>
          </div>

          <Alert className="border-2 border-green-200 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Excellent work!</strong> You can now proceed to the Assessment section 
              to test your understanding and earn your achievement certificate! 🏆
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Badge variant="default" className="text-lg px-4 py-2 bg-green-600">
              ✅ Quiz Unlocked Assessment Section
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-green-800">
                🧩 Practice Quiz
              </CardTitle>
              <CardDescription className="text-green-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardDescription>
            </div>
            <div className="text-right space-y-1">
              <Badge variant="secondary" className="bg-green-200 text-green-800">
                Score: {score}/{questions.length}
              </Badge>
              <div className="flex items-center text-sm text-green-600">
                <Clock className="h-4 w-4 mr-1" />
                Practice Mode
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`${getDifficultyColor(currentQuestion.difficulty_level)} border-2 font-medium`}
            >
              {getDifficultyIcon(currentQuestion.difficulty_level)} 
              {currentQuestion.difficulty_level.charAt(0).toUpperCase() + currentQuestion.difficulty_level.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              {currentQuestion.topic}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-gray-800 leading-relaxed mt-4">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <RadioGroup 
            value={selectedAnswer} 
            onValueChange={handleAnswerSelection}
            className="space-y-4"
            disabled={isAnswerSubmitted}
          >
            {[
              { value: 'A', text: currentQuestion.option_a },
              { value: 'B', text: currentQuestion.option_b },
              { value: 'C', text: currentQuestion.option_c },
              { value: 'D', text: currentQuestion.option_d }
            ].map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value}
                  disabled={isAnswerSubmitted}
                  className={
                    isAnswerSubmitted
                      ? option.value === currentQuestion.correct_answer
                        ? 'border-green-500 text-green-500'
                        : option.value === selectedAnswer && option.value !== currentQuestion.correct_answer
                        ? 'border-red-500 text-red-500'
                        : ''
                      : ''
                  }
                />
                <Label 
                  htmlFor={option.value}
                  className={`flex-1 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                    isAnswerSubmitted
                      ? option.value === currentQuestion.correct_answer
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : option.value === selectedAnswer && option.value !== currentQuestion.correct_answer
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-gray-50 border-gray-200'
                      : selectedAnswer === option.value
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <span className="font-semibold mr-2">{option.value}.</span>
                  {option.text}
                  {isAnswerSubmitted && option.value === currentQuestion.correct_answer && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 inline ml-2" />
                  )}
                  {isAnswerSubmitted && option.value === selectedAnswer && option.value !== currentQuestion.correct_answer && (
                    <XCircle className="h-5 w-5 text-red-600 inline ml-2" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Explanation */}
          {showExplanation && currentQuestion.explanation && (
            <Alert className="mt-6 border-2 border-blue-200 bg-blue-50">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>💡 Explanation:</strong> {currentQuestion.explanation}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <div className="text-sm text-gray-500">
              {answers.length > 0 && (
                <span>
                  Progress: {correctAnswers} correct out of {answers.length} answered
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              {!isAnswerSubmitted ? (
                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className="bg-green-600 hover:bg-green-700 px-6"
                >
                  📝 Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="bg-indigo-600 hover:bg-indigo-700 px-6"
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>Next Question →</>
                  ) : (
                    <>🏁 Finish Quiz</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}