import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Printer, Star, Clock, Target, BookOpen, Award } from 'lucide-react';
import type { AchievementReport } from '../../../server/src/schema';

interface AchievementViewProps {
  report: AchievementReport | null;
  isLoading: boolean;
  onPrint: () => void;
}

export function AchievementView({ report, isLoading, onPrint }: AchievementViewProps) {
  if (isLoading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500 space-y-4">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="text-lg">Generating your achievement report...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto">
              <div className="h-2 bg-purple-500 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No achievement report available</p>
            <p className="text-sm mt-2">Complete the assessment to generate your report.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-700 bg-green-100 border-green-300';
      case 'good': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'satisfactory': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'needs_improvement': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getPerformanceIcon = (level: string) => {
    switch (level) {
      case 'excellent': return '🌟';
      case 'good': return '👍';
      case 'satisfactory': return '👌';
      case 'needs_improvement': return '📚';
      default: return '⭐';
    }
  };

  const getGradeEmoji = (percentage: number) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🥇';
    if (percentage >= 70) return '🥈';
    if (percentage >= 60) return '🥉';
    return '📖';
  };

  const overallPercentage = Math.round(
    ((report.quiz_details.correct_answers + report.assessment_details.correct_answers) / 
     (report.quiz_details.total_questions + report.assessment_details.total_questions)) * 100
  );

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Print Button - Hidden in Print */}
      <div className="print:hidden">
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-800">Achievement Report Ready!</h3>
                  <p className="text-sm text-purple-600">Your complete learning assessment is available below.</p>
                </div>
              </div>
              <Button 
                onClick={onPrint}
                className="bg-purple-600 hover:bg-purple-700 print:hidden"
              >
                <Printer className="h-4 w-4 mr-2" />
                🖨️ Print Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Achievement Certificate */}
      <Card className="border-4 border-purple-300 shadow-2xl print:shadow-none print:border-2">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white print:bg-none print:text-black print:border-b-2">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-2">
              <Trophy className="h-12 w-12 text-yellow-300 print:text-gray-600" />
              <Award className="h-12 w-12 text-yellow-300 print:text-gray-600" />
              <Star className="h-12 w-12 text-yellow-300 print:text-gray-600" />
            </div>
            <CardTitle className="text-4xl font-bold print:text-3xl print:text-black">
              🏆 CERTIFICATE OF ACHIEVEMENT
            </CardTitle>
            <CardDescription className="text-xl text-purple-100 print:text-lg print:text-gray-700">
              Set Theory: Intersection & Union of Sets
            </CardDescription>
            <Badge className="text-lg px-4 py-2 bg-white/20 text-white border-white/30 print:bg-gray-100 print:text-gray-800 print:border-gray-300">
              7th Grade Mathematics
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-8 print:p-6">
          {/* Student Information */}
          <div className="text-center mb-8 print:mb-6">
            <div className="mb-4">
              <p className="text-lg text-gray-600 print:text-base">This certifies that</p>
              <div className="flex items-center justify-center space-x-3 my-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl print:bg-gray-300 print:text-gray-700">
                  {report.student.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-gray-800 print:text-2xl">{report.student.name}</h2>
                  <p className="text-lg text-gray-600 print:text-base">Grade {report.student.grade}</p>
                </div>
              </div>
              <p className="text-lg text-gray-600 print:text-base">
                has successfully completed the interactive learning module on
              </p>
              <p className="text-2xl font-bold text-purple-700 mt-2 print:text-xl print:text-black">
                "Intersection and Union of Sets"
              </p>
            </div>
          </div>

          <Separator className="my-6 print:my-4" />

          {/* Performance Summary */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 print:gap-4 print:mb-6">
            {/* Overall Performance */}
            <Card className="border-2 border-purple-200 print:border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg print:text-base">
                  <Target className="h-5 w-5 text-purple-600 print:text-gray-600" />
                  <span>Overall Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3 print:space-y-2">
                  <div className="text-4xl print:text-3xl">{getGradeEmoji(overallPercentage)}</div>
                  <div className="text-3xl font-bold text-purple-700 print:text-2xl print:text-black">
                    {overallPercentage}%
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-sm px-3 py-1 border-2 ${getPerformanceColor(report.achievement.performance_level)}`}
                  >
                    {getPerformanceIcon(report.achievement.performance_level)} 
                    {report.achievement.performance_level.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Study Metrics */}
            <Card className="border-2 border-indigo-200 print:border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg print:text-base">
                  <Clock className="h-5 w-5 text-indigo-600 print:text-gray-600" />
                  <span>Study Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 print:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 print:text-black">Time Spent:</span>
                  <Badge variant="outline" className="print:border-gray-400">
                    ⏱️ {report.achievement.time_spent_minutes || 'N/A'} minutes
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 print:text-black">Completion Date:</span>
                  <Badge variant="outline" className="print:border-gray-400">
                    📅 {report.achievement.completion_date.toLocaleDateString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 print:text-black">Total Questions:</span>
                  <Badge variant="outline" className="print:border-gray-400">
                    📝 {report.quiz_details.total_questions + report.assessment_details.total_questions}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 print:gap-4 print:mb-6">
            {/* Quiz Performance */}
            <Card className="border-2 border-green-200 print:border-gray-300">
              <CardHeader className="bg-green-50 print:bg-none">
                <CardTitle className="flex items-center space-x-2 text-lg text-green-800 print:text-base print:text-black">
                  <BookOpen className="h-5 w-5" />
                  <span>🧩 Practice Quiz</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4 print:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 print:text-black">Score:</span>
                    <span className="font-bold text-green-700 print:text-black">
                      {report.quiz_details.correct_answers}/{report.quiz_details.total_questions}
                    </span>
                  </div>
                  <Progress 
                    value={report.quiz_details.score_percentage} 
                    className="h-3 print:h-2"
                  />
                  <div className="text-center">
                    <Badge className="bg-green-600 print:bg-gray-300 print:text-black">
                      {report.quiz_details.score_percentage}% Correct
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Performance */}
            <Card className="border-2 border-orange-200 print:border-gray-300">
              <CardHeader className="bg-orange-50 print:bg-none">
                <CardTitle className="flex items-center space-x-2 text-lg text-orange-800 print:text-base print:text-black">
                  <Award className="h-5 w-5" />
                  <span>🎯 Final Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4 print:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 print:text-black">Score:</span>
                    <span className="font-bold text-orange-700 print:text-black">
                      {report.assessment_details.correct_answers}/{report.assessment_details.total_questions}
                    </span>
                  </div>
                  <Progress 
                    value={report.assessment_details.score_percentage} 
                    className="h-3 print:h-2"
                  />
                  <div className="text-center">
                    <Badge className="bg-orange-600 print:bg-gray-300 print:text-black">
                      {report.assessment_details.score_percentage}% Correct
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Outcomes */}
          <Card className="border-2 border-blue-200 mb-6 print:border-gray-300 print:mb-4">
            <CardHeader className="bg-blue-50 print:bg-none">
              <CardTitle className="text-lg text-blue-800 print:text-base print:text-black">
                📚 Learning Outcomes Achieved
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm print:text-xs">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 print:text-black">✅</span>
                    <span className="print:text-black">Understanding set notation and terminology</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 print:text-black">✅</span>
                    <span className="print:text-black">Calculating union of sets (A ∪ B)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 print:text-black">✅</span>
                    <span className="print:text-black">Calculating intersection of sets (A ∩ B)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 print:text-black">✅</span>
                    <span className="print:text-black">Interpreting Venn diagrams</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Footer */}
          <div className="text-center space-y-4 print:space-y-2">
            <Separator className="mb-4 print:mb-2" />
            <p className="text-lg font-semibold text-gray-700 print:text-base print:text-black">
              🌟 Congratulations on your mathematical achievement! 🌟
            </p>
            <p className="text-sm text-gray-600 print:text-xs print:text-black">
              Awarded on {report.achievement.completion_date.toLocaleDateString()} 
              • Interactive Mathematics Learning Platform
            </p>
            
            {/* Print-only signature line */}
            <div className="hidden print:block mt-8 pt-4 border-t border-gray-300">
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="border-t border-gray-400 w-48 mb-2"></div>
                  <p className="text-xs text-gray-600">Mathematics Instructor</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-400 w-48 mb-2"></div>
                  <p className="text-xs text-gray-600">Date</p>
                </div>
              </div>
            </div>

            <div className="print:hidden">
              <Alert className="border-2 border-purple-200 bg-purple-50 mt-6">
                <Star className="h-5 w-5 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>Well done!</strong> You have successfully mastered the concepts of Set Theory. 
                  Keep up the excellent work in mathematics! 🎓
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}