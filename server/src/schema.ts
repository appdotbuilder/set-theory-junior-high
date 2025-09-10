import { z } from 'zod';

// Student schema
export const studentSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  grade: z.string(),
  created_at: z.coerce.date()
});

export type Student = z.infer<typeof studentSchema>;

// Input schema for creating students
export const createStudentInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  grade: z.string().min(1)
});

export type CreateStudentInput = z.infer<typeof createStudentInputSchema>;

// Material section schema
export const materialSectionSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  topic: z.string(),
  order: z.number().int(),
  created_at: z.coerce.date()
});

export type MaterialSection = z.infer<typeof materialSectionSchema>;

// Quiz question schema
export const quizQuestionSchema = z.object({
  id: z.number(),
  question_text: z.string(),
  option_a: z.string(),
  option_b: z.string(),
  option_c: z.string(),
  option_d: z.string(),
  correct_answer: z.enum(['A', 'B', 'C', 'D']),
  question_type: z.enum(['quiz', 'assessment']),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  topic: z.string(),
  explanation: z.string().nullable(),
  created_at: z.coerce.date()
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

// Input schema for creating quiz questions
export const createQuizQuestionInputSchema = z.object({
  question_text: z.string().min(1),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().min(1),
  option_d: z.string().min(1),
  correct_answer: z.enum(['A', 'B', 'C', 'D']),
  question_type: z.enum(['quiz', 'assessment']),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().min(1),
  explanation: z.string().nullable()
});

export type CreateQuizQuestionInput = z.infer<typeof createQuizQuestionInputSchema>;

// Quiz attempt schema
export const quizAttemptSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  question_id: z.number(),
  selected_answer: z.enum(['A', 'B', 'C', 'D']),
  is_correct: z.boolean(),
  attempt_type: z.enum(['quiz', 'assessment']),
  created_at: z.coerce.date()
});

export type QuizAttempt = z.infer<typeof quizAttemptSchema>;

// Input schema for submitting quiz answers
export const submitQuizAnswerInputSchema = z.object({
  student_id: z.number(),
  question_id: z.number(),
  selected_answer: z.enum(['A', 'B', 'C', 'D']),
  attempt_type: z.enum(['quiz', 'assessment'])
});

export type SubmitQuizAnswerInput = z.infer<typeof submitQuizAnswerInputSchema>;

// Student achievement schema
export const studentAchievementSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  quiz_score: z.number().int().min(0).max(100),
  assessment_score: z.number().int().min(0).max(100),
  total_quiz_questions: z.number().int(),
  correct_quiz_answers: z.number().int(),
  total_assessment_questions: z.number().int(),
  correct_assessment_answers: z.number().int(),
  completion_date: z.coerce.date(),
  time_spent_minutes: z.number().int().nullable(),
  performance_level: z.enum(['excellent', 'good', 'satisfactory', 'needs_improvement']),
  created_at: z.coerce.date()
});

export type StudentAchievement = z.infer<typeof studentAchievementSchema>;

// Input schema for creating student achievements
export const createStudentAchievementInputSchema = z.object({
  student_id: z.number(),
  quiz_score: z.number().int().min(0).max(100),
  assessment_score: z.number().int().min(0).max(100),
  total_quiz_questions: z.number().int(),
  correct_quiz_answers: z.number().int(),
  total_assessment_questions: z.number().int(),
  correct_assessment_answers: z.number().int(),
  time_spent_minutes: z.number().int().nullable(),
  performance_level: z.enum(['excellent', 'good', 'satisfactory', 'needs_improvement'])
});

export type CreateStudentAchievementInput = z.infer<typeof createStudentAchievementInputSchema>;

// Achievement report schema for display and printing
export const achievementReportSchema = z.object({
  student: studentSchema,
  achievement: studentAchievementSchema,
  quiz_details: z.object({
    total_questions: z.number().int(),
    correct_answers: z.number().int(),
    score_percentage: z.number().int(),
    questions_attempted: z.array(quizAttemptSchema)
  }),
  assessment_details: z.object({
    total_questions: z.number().int(),
    correct_answers: z.number().int(),
    score_percentage: z.number().int(),
    questions_attempted: z.array(quizAttemptSchema)
  })
});

export type AchievementReport = z.infer<typeof achievementReportSchema>;

// Input schema for getting achievement report
export const getAchievementReportInputSchema = z.object({
  student_id: z.number(),
  achievement_id: z.number().optional()
});

export type GetAchievementReportInput = z.infer<typeof getAchievementReportInputSchema>;