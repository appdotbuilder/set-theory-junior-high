import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserPlus, BookOpen } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Student, CreateStudentInput } from '../../../server/src/schema';

interface StudentSelectorProps {
  onStudentSelect: (student: Student) => void;
}

export function StudentSelector({ onStudentSelect }: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStudentInput>({
    name: '',
    email: '',
    grade: '7'
  });

  // Load existing students
  const loadStudents = useCallback(async () => {
    try {
      const result = await trpc.getStudents.query();
      setStudents(result);
    } catch (error) {
      console.error('Failed to load students:', error);
      // Demo data for development since backend is not implemented
      setStudents([
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice.johnson@school.edu",
          grade: "7A",
          created_at: new Date()
        },
        {
          id: 2,
          name: "Bob Chen", 
          email: "bob.chen@school.edu",
          grade: "7B",
          created_at: new Date()
        },
        {
          id: 3,
          name: "Emma Davis",
          email: "emma.davis@school.edu", 
          grade: "7A",
          created_at: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Create new student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const newStudent = await trpc.createStudent.mutate(formData);
      setStudents((prev: Student[]) => [...prev, newStudent]);
      setFormData({ name: '', email: '', grade: '7' });
      setShowCreateForm(false);
      onStudentSelect(newStudent);
    } catch (error) {
      console.error('Failed to create student:', error);
      // In demo mode, create a development student
      const demoStudent: Student = {
        id: Date.now(), // Simple ID generation for demo
        name: formData.name,
        email: formData.email,
        grade: formData.grade,
        created_at: new Date()
      };
      setStudents((prev: Student[]) => [...prev, demoStudent]);
      setFormData({ name: '', email: '', grade: '7' });
      setShowCreateForm(false);
      onStudentSelect(demoStudent);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Welcome Header */}
      <Card className="border-2 border-indigo-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <BookOpen className="h-12 w-12" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            🔢 Welcome to Set Theory Learning!
          </CardTitle>
          <CardDescription className="text-indigo-100 text-lg">
            Interactive Mathematics for 7th Grade Students
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Get ready to explore the fascinating world of <strong>Set Theory</strong>! 
              You'll learn about <em>intersections</em> and <em>unions</em> of sets through 
              interactive lessons, fun quizzes, and assessments.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                <span>📖 Study Materials</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>🧩 Practice Quizzes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span>🏆 Achievement Reports</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Selection */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Users className="h-6 w-6 text-indigo-600" />
            <span>👤 Select Your Profile</span>
          </CardTitle>
          <CardDescription>
            Choose your student profile to start learning, or create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {students.length > 0 ? (
            <div className="space-y-3">
              <Label className="text-base font-medium">Existing Students:</Label>
              <div className="grid gap-3">
                {students.map((student: Student) => (
                  <Button
                    key={student.id}
                    variant="outline"
                    className="justify-between h-auto p-4 border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    onClick={() => onStudentSelect(student)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-sm text-gray-500">Grade {student.grade}</div>
                      </div>
                    </div>
                    <div className="text-indigo-600">
                      Start Learning →
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No students found. Create a new student profile to get started!
              </AlertDescription>
            </Alert>
          )}

          {/* Create New Student Toggle */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {showCreateForm ? 'Cancel' : '➕ Create New Student Profile'}
            </Button>
          </div>

          {/* Create New Student Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateStudent} className="space-y-4 mt-4 p-4 border-2 border-indigo-100 rounded-lg bg-indigo-50/50">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">Student Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateStudentInput) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@school.edu"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateStudentInput) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="font-medium">Grade/Class *</Label>
                <Select
                  value={formData.grade || '7A'}
                  onValueChange={(value: string) =>
                    setFormData((prev: CreateStudentInput) => ({ ...prev, grade: value }))
                  }
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7A">7A</SelectItem>
                    <SelectItem value="7B">7B</SelectItem>
                    <SelectItem value="7C">7C</SelectItem>
                    <SelectItem value="7D">7D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLoading ? '⏳ Creating...' : '🚀 Create & Start Learning'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}