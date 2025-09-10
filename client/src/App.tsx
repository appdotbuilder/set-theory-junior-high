import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Trophy, CheckCircle2, Award } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { 
  Student, 
  MaterialSection, 
  QuizQuestion, 
  SubmitQuizAnswerInput,
  AchievementReport 
} from '../../server/src/schema';
import { StudentSelector } from '@/components/StudentSelector';
import { MaterialView } from '@/components/MaterialView';
import { QuizView } from '@/components/QuizView';
import { AssessmentView } from '@/components/AssessmentView';
import { AchievementView } from '@/components/AchievementView';

function App() {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<string>('material');
  const [materialSections, setMaterialSections] = useState<MaterialSection[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<QuizQuestion[]>([]);
  const [achievementReport, setAchievementReport] = useState<AchievementReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  // Load material sections on mount
  const loadMaterialSections = useCallback(async () => {
    try {
      const result = await trpc.getMaterialSections.query();
      setMaterialSections(result);
    } catch (error) {
      console.error('Failed to load material sections:', error);
      // Stub data for demonstration since backend is not implemented
      setMaterialSections([
        {
          id: 1,
          title: "📚 Introduction to Set Theory",
          content: "Welcome to Set Theory! A set is a collection of distinct objects. In mathematics, sets are fundamental building blocks that help us organize and work with groups of objects. Today we'll learn about two important operations: intersection (∩) and union (∪) of sets.",
          topic: "Set Theory Basics",
          order: 1,
          created_at: new Date()
        },
        {
          id: 2,
          title: "🔗 Union of Sets",
          content: "The union of two sets A and B, written as A ∪ B, is a new set containing all elements that are in set A, in set B, or in both sets. For example: If A = {1, 2, 3} and B = {3, 4, 5}, then A ∪ B = {1, 2, 3, 4, 5}. Notice that we don't repeat the number 3 - each element appears only once in a set!",
          topic: "Union Operations",
          order: 2,
          created_at: new Date()
        },
        {
          id: 3,
          title: "🎯 Intersection of Sets",
          content: "The intersection of two sets A and B, written as A ∩ B, is a new set containing only the elements that are in both set A and set B. Using our previous example: If A = {1, 2, 3} and B = {3, 4, 5}, then A ∩ B = {3}. The intersection contains only the elements that the sets have in common.",
          topic: "Intersection Operations",
          order: 3,
          created_at: new Date()
        },
        {
          id: 4,
          title: "🎨 Venn Diagrams",
          content: "Venn diagrams are visual tools that help us understand sets and their relationships. In a Venn diagram, each set is represented by a circle. The union (∪) includes everything in both circles, while the intersection (∩) is the overlapping area where both circles meet. This visual approach makes it easier to solve set problems!",
          topic: "Visual Representation",
          order: 4,
          created_at: new Date()
        }
      ]);
    }
  }, []);

  // Load quiz questions
  const loadQuizQuestions = useCallback(async () => {
    try {
      const result = await trpc.getQuizQuestions.query({ questionType: 'quiz' });
      setQuizQuestions(result);
    } catch (error) {
      console.error('Failed to load quiz questions:', error);
      // Stub data for demonstration
      setQuizQuestions([
        {
          id: 1,
          question_text: "If set A = {1, 2, 3, 4} and set B = {3, 4, 5, 6}, what is A ∪ B?",
          option_a: "{1, 2, 3, 4, 5, 6}",
          option_b: "{3, 4}",
          option_c: "{1, 2, 5, 6}",
          option_d: "{1, 2, 3, 4, 3, 4, 5, 6}",
          correct_answer: 'A',
          question_type: 'quiz',
          difficulty_level: 'easy',
          topic: "Set Theory",
          explanation: "The union includes all unique elements from both sets: {1, 2, 3, 4, 5, 6}",
          created_at: new Date()
        },
        {
          id: 2,
          question_text: "What is the intersection of sets C = {a, b, c, d} and D = {c, d, e, f}?",
          option_a: "{a, b, e, f}",
          option_b: "{c, d}",
          option_c: "{a, b, c, d, e, f}",
          option_d: "{}",
          correct_answer: 'B',
          question_type: 'quiz',
          difficulty_level: 'easy',
          topic: "Set Theory",
          explanation: "The intersection contains only elements present in both sets: {c, d}",
          created_at: new Date()
        },
        {
          id: 3,
          question_text: "If P = {red, blue} and Q = {green, yellow}, what is P ∩ Q?",
          option_a: "{red, blue, green, yellow}",
          option_b: "{red, blue}",
          option_c: "{green, yellow}",
          option_d: "∅ (empty set)",
          correct_answer: 'D',
          question_type: 'quiz',
          difficulty_level: 'medium',
          topic: "Set Theory",
          explanation: "Since P and Q have no common elements, their intersection is empty (∅)",
          created_at: new Date()
        }
      ]);
    }
  }, []);

  // Load assessment questions
  const loadAssessmentQuestions = useCallback(async () => {
    try {
      const result = await trpc.getQuizQuestions.query({ questionType: 'assessment' });
      setAssessmentQuestions(result);
    } catch (error) {
      console.error('Failed to load assessment questions:', error);
      // Stub data for demonstration
      setAssessmentQuestions([
        {
          id: 4,
          question_text: "Given sets X = {2, 4, 6, 8, 10} and Y = {1, 2, 3, 4, 5}, find (X ∪ Y) ∩ {2, 4, 6}.",
          option_a: "{2, 4}",
          option_b: "{2, 4, 6}",
          option_c: "{1, 2, 3, 4, 5, 6, 8, 10}",
          option_d: "{6}",
          correct_answer: 'B',
          question_type: 'assessment',
          difficulty_level: 'hard',
          topic: "Set Theory",
          explanation: "First find X ∪ Y = {1, 2, 3, 4, 5, 6, 8, 10}, then intersect with {2, 4, 6} to get {2, 4, 6}",
          created_at: new Date()
        },
        {
          id: 5,
          question_text: "In a class of 30 students, 18 like Mathematics and 20 like Science. If 12 students like both subjects, how many students like at least one of these subjects?",
          option_a: "26 students",
          option_b: "30 students", 
          option_c: "38 students",
          option_d: "24 students",
          correct_answer: 'A',
          question_type: 'assessment',
          difficulty_level: 'hard',
          topic: "Set Theory",
          explanation: "Using |M ∪ S| = |M| + |S| - |M ∩ S| = 18 + 20 - 12 = 26 students",
          created_at: new Date()
        }
      ]);
    }
  }, []);

  // Submit quiz answer
  const submitQuizAnswer = async (input: SubmitQuizAnswerInput) => {
    if (!currentStudent) return;
    
    try {
      await trpc.submitQuizAnswer.mutate(input);
    } catch (error) {
      console.error('Failed to submit quiz answer:', error);
      // In stub mode, we'll just continue without backend storage
    }
  };

  // Load achievement report
  const loadAchievementReport = useCallback(async () => {
    if (!currentStudent) return;
    
    try {
      setIsLoading(true);
      const report = await trpc.getAchievementReport.query({ 
        student_id: currentStudent.id 
      });
      setAchievementReport(report);
    } catch (error) {
      console.error('Failed to load achievement report:', error);
      // Stub data for demonstration
      setAchievementReport({
        student: currentStudent,
        achievement: {
          id: 1,
          student_id: currentStudent.id,
          quiz_score: 85,
          assessment_score: 78,
          total_quiz_questions: 3,
          correct_quiz_answers: 2,
          total_assessment_questions: 2,
          correct_assessment_answers: 1,
          completion_date: new Date(),
          time_spent_minutes: 25,
          performance_level: 'good',
          created_at: new Date()
        },
        quiz_details: {
          total_questions: 3,
          correct_answers: 2,
          score_percentage: 67,
          questions_attempted: []
        },
        assessment_details: {
          total_questions: 2,
          correct_answers: 1,
          score_percentage: 50,
          questions_attempted: []
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentStudent]);

  // Load data when student is selected
  useEffect(() => {
    loadMaterialSections();
    loadQuizQuestions();
    loadAssessmentQuestions();
  }, [loadMaterialSections, loadQuizQuestions, loadAssessmentQuestions]);

  // Handle quiz completion
  const handleQuizComplete = (score: number, totalQuestions: number) => {
    setQuizCompleted(true);
    console.log(`Quiz completed: ${score}/${totalQuestions}`);
  };

  // Handle assessment completion
  const handleAssessmentComplete = (score: number, totalQuestions: number) => {
    setAssessmentCompleted(true);
    setActiveTab('achievement');
    loadAchievementReport();
    console.log(`Assessment completed: ${score}/${totalQuestions}`);
  };

  // Print achievement report
  const handlePrintReport = () => {
    window.print();
  };

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <StudentSelector onStudentSelect={setCurrentStudent} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <Card className="mb-6 border-2 border-indigo-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    🔢 Set Theory: Intersection & Union
                  </CardTitle>
                  <CardDescription className="text-indigo-100">
                    Interactive Learning for 7th Grade Mathematics
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{currentStudent.name}</span>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Grade {currentStudent.grade}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-white border-2 border-indigo-200 shadow-md">
            <TabsTrigger 
              value="material" 
              className="flex items-center space-x-2 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
            >
              <BookOpen className="h-4 w-4" />
              <span>📖 Learn</span>
            </TabsTrigger>
            <TabsTrigger 
              value="quiz"
              className="flex items-center space-x-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>🧩 Quiz</span>
            </TabsTrigger>
            <TabsTrigger 
              value="assessment"
              disabled={!quizCompleted}
              className="flex items-center space-x-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 disabled:opacity-50"
            >
              <Award className="h-4 w-4" />
              <span>🎯 Test</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievement"
              disabled={!assessmentCompleted}
              className="flex items-center space-x-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 disabled:opacity-50"
            >
              <Trophy className="h-4 w-4" />
              <span>🏆 Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="material">
            <MaterialView 
              sections={materialSections}
              onComplete={() => console.log('Material section completed')}
            />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizView
              questions={quizQuestions}
              student={currentStudent}
              onAnswerSubmit={submitQuizAnswer}
              onComplete={handleQuizComplete}
              isCompleted={quizCompleted}
            />
          </TabsContent>

          <TabsContent value="assessment">
            <AssessmentView
              questions={assessmentQuestions}
              student={currentStudent}
              onAnswerSubmit={submitQuizAnswer}
              onComplete={handleAssessmentComplete}
              isCompleted={assessmentCompleted}
            />
          </TabsContent>

          <TabsContent value="achievement">
            <AchievementView
              report={achievementReport}
              isLoading={isLoading}
              onPrint={handlePrintReport}
            />
          </TabsContent>
        </Tabs>

        {/* Progress Footer */}
        <Card className="mt-6 border-2 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">Learning Progress:</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={activeTab === 'material' ? 'default' : 'secondary'}>
                    📖 Material
                  </Badge>
                  <Badge variant={quizCompleted ? 'default' : 'secondary'}>
                    🧩 Quiz {quizCompleted && '✅'}
                  </Badge>
                  <Badge variant={assessmentCompleted ? 'default' : 'secondary'}>
                    🎯 Assessment {assessmentCompleted && '✅'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStudent(null)}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                👤 Change Student
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;