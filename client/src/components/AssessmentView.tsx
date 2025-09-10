import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, Clock, Award, AlertTriangle } from 'lucide-react';
import type { QuizQuestion, Student, SubmitQuizAnswerInput } from '../../../server/src/schema';

interface AssessmentViewProps {
  questions: QuizQuestion[];
  student: Student;
  onAnswerSubmit: (input: SubmitQuizAnswerInput) => Promise<void>;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted: boolean;
}

interface AssessmentAnswer {
  questionId: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
}

export function AssessmentView({ questions, student, onAnswerSubmit, onComplete, isCompleted }: AssessmentViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | ''>('');
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<AssessmentAnswer[]>([]);
  const [startTime] = useState<Date>(new Date());
  const [assessmentFinished, setAssessmentFinished] = useState(isCompleted);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredQuestions = Object.keys(answers).length;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Load current question's answer
  useEffect(() => {
    if (currentQuestion && answers[currentQuestion.id]) {
      setSelectedAnswer(answers[currentQuestion.id]);
    } else {
      setSelectedAnswer('');
    }
  }, [currentQuestionIndex, currentQuestion, answers]);

  const handleAnswerSelection = (answer: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswer(answer);
    if (currentQuestion) {
      setAnswers((prev: Record<number, 'A' | 'B' | 'C' | 'D'>) => ({
        ...prev,
        [currentQuestion.id]: answer
      }));
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitAssessment = async () => {
    setShowSubmitDialog(false);
    
    // Submit all answers
    const assessmentResults: AssessmentAnswer[] = [];
    
    for (const question of questions) {
      const selectedAns = answers[question.id];
      if (selectedAns) {
        const isCorrect = selectedAns === question.correct_answer;
        
        // Submit to backend
        try {
          await onAnswerSubmit({
            student_id: student.id,
            question_id: question.id,
            selected_answer: selectedAns,
            attempt_type: 'assessment'
          });
        } catch (error) {
          console.error('Failed to submit answer:', error);
        }

        assessmentResults.push({
          questionId: question.id,
          selectedAnswer: selectedAns,
          isCorrect: isCorrect
        });
      }
    }

    setSubmittedAnswers(assessmentResults);
    const correctCount = assessmentResults.filter((answer: AssessmentAnswer) => answer.isCorrect).length;
    setAssessmentFinished(true);
    onComplete(correctCount, questions.length);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      <Card className="border-2 border-orange-200">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Loading assessment questions...</p>
            <p className="text-sm mt-2">🎯 Preparing your final evaluation!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assessmentFinished) {
    const correctAnswers = submittedAnswers.filter((answer: AssessmentAnswer) => answer.isCorrect).length;
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const finalTimeMinutes = Math.round(timeElapsed / 60);
    
    return (
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 text-center">
          <div className="flex justify-center mb-4">
            <Award className="h-16 w-16 text-purple-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-purple-800">
            🎯 Assessment Complete!
          </CardTitle>
          <CardDescription className="text-purple-700 text-lg">
            Excellent work, {student.name}! Your final evaluation is ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{correctAnswers}</div>
              <div className="text-sm text-blue-600">Correct</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{percentage}%</div>
              <div className="text-sm text-purple-600">Score</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{finalTimeMinutes}</div>
              <div className="text-sm text-orange-600">Minutes</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '📚'}
              </div>
              <div className="text-sm text-green-600">
                {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Study More'}
              </div>
            </div>
          </div>

          <Alert className="border-2 border-purple-200 bg-purple-50">
            <Award className="h-5 w-5 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Assessment completed!</strong> Check your detailed achievement report 
              in the Results tab to see your complete performance analysis and certificate! 🏆
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Badge variant="default" className="text-lg px-4 py-2 bg-purple-600">
              ✅ Ready to View Achievement Report
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-orange-800">
                🎯 Final Assessment
              </CardTitle>
              <CardDescription className="text-orange-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardDescription>
            </div>
            <div className="text-right space-y-1">
              <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(timeElapsed)}
              </Badge>
              <div className="text-sm text-orange-600">
                {answeredQuestions}/{questions.length} answered
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Navigation */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Question Navigation:</span>
            <Alert className="py-2 px-3 border-orange-200 bg-orange-50 w-auto">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-xs text-orange-700">
                This is your final assessment. Review all answers before submitting.
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex items-center justify-center space-x-2 flex-wrap">
            {questions.map((question: QuizQuestion, index: number) => (
              <Button
                key={question.id}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                onClick={() => goToQuestion(index)}
                className={`min-w-0 ${
                  index === currentQuestionIndex 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : answers[question.id]
                    ? 'border-green-300 text-green-700 hover:bg-green-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {answers[question.id] && (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                )}
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-orange-50">
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`${getDifficultyColor(currentQuestion.difficulty_level)} border-2 font-medium`}
            >
              {getDifficultyIcon(currentQuestion.difficulty_level)} 
              {currentQuestion.difficulty_level.charAt(0).toUpperCase() + currentQuestion.difficulty_level.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
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
                />
                <Label 
                  htmlFor={option.value}
                  className={`flex-1 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                    selectedAnswer === option.value
                      ? 'bg-orange-100 border-orange-300'
                      : 'bg-gray-50 border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <span className="font-semibold mr-2">{option.value}.</span>
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="border-gray-300"
            >
              ← Previous
            </Button>

            <div className="flex space-x-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={nextQuestion}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Next Question →
                </Button>
              ) : (
                <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 px-6"
                      disabled={answeredQuestions < questions.length}
                    >
                      🏁 Submit Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Final Assessment</DialogTitle>
                      <DialogDescription>
                        Are you ready to submit your assessment? You have answered{' '}
                        <strong>{answeredQuestions} out of {questions.length}</strong> questions.
                        <br /><br />
                        <strong>Time elapsed:</strong> {formatTime(timeElapsed)}
                        <br />
                        <strong>Warning:</strong> You cannot change your answers after submission.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                        Review More
                      </Button>
                      <Button 
                        onClick={submitAssessment}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        📝 Final Submit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {answeredQuestions < questions.length && (
            <Alert className="mt-4 border-2 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Incomplete:</strong> Please answer all {questions.length} questions before submitting. 
                ({questions.length - answeredQuestions} questions remaining)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}