import { serial, text, pgTable, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const answerOptionEnum = pgEnum('answer_option', ['A', 'B', 'C', 'D']);
export const questionTypeEnum = pgEnum('question_type', ['quiz', 'assessment']);
export const difficultyLevelEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard']);
export const attemptTypeEnum = pgEnum('attempt_type', ['quiz', 'assessment']);
export const performanceLevelEnum = pgEnum('performance_level', ['excellent', 'good', 'satisfactory', 'needs_improvement']);

// Students table
export const studentsTable = pgTable('students', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  grade: text('grade').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Material sections table
export const materialSectionsTable = pgTable('material_sections', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  topic: text('topic').notNull(),
  order: integer('order').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Quiz questions table
export const quizQuestionsTable = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  question_text: text('question_text').notNull(),
  option_a: text('option_a').notNull(),
  option_b: text('option_b').notNull(),
  option_c: text('option_c').notNull(),
  option_d: text('option_d').notNull(),
  correct_answer: answerOptionEnum('correct_answer').notNull(),
  question_type: questionTypeEnum('question_type').notNull(),
  difficulty_level: difficultyLevelEnum('difficulty_level').notNull(),
  topic: text('topic').notNull(),
  explanation: text('explanation'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Quiz attempts table
export const quizAttemptsTable = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(),
  question_id: integer('question_id').notNull(),
  selected_answer: answerOptionEnum('selected_answer').notNull(),
  is_correct: boolean('is_correct').notNull(),
  attempt_type: attemptTypeEnum('attempt_type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Student achievements table
export const studentAchievementsTable = pgTable('student_achievements', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(),
  quiz_score: integer('quiz_score').notNull(),
  assessment_score: integer('assessment_score').notNull(),
  total_quiz_questions: integer('total_quiz_questions').notNull(),
  correct_quiz_answers: integer('correct_quiz_answers').notNull(),
  total_assessment_questions: integer('total_assessment_questions').notNull(),
  correct_assessment_answers: integer('correct_assessment_answers').notNull(),
  completion_date: timestamp('completion_date').defaultNow().notNull(),
  time_spent_minutes: integer('time_spent_minutes'), // Nullable
  performance_level: performanceLevelEnum('performance_level').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const studentsRelations = relations(studentsTable, ({ many }) => ({
  quizAttempts: many(quizAttemptsTable),
  achievements: many(studentAchievementsTable)
}));

export const quizQuestionsRelations = relations(quizQuestionsTable, ({ many }) => ({
  attempts: many(quizAttemptsTable)
}));

export const quizAttemptsRelations = relations(quizAttemptsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [quizAttemptsTable.student_id],
    references: [studentsTable.id]
  }),
  question: one(quizQuestionsTable, {
    fields: [quizAttemptsTable.question_id],
    references: [quizQuestionsTable.id]
  })
}));

export const studentAchievementsRelations = relations(studentAchievementsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [studentAchievementsTable.student_id],
    references: [studentsTable.id]
  })
}));

// TypeScript types for the table schemas
export type Student = typeof studentsTable.$inferSelect;
export type NewStudent = typeof studentsTable.$inferInsert;

export type MaterialSection = typeof materialSectionsTable.$inferSelect;
export type NewMaterialSection = typeof materialSectionsTable.$inferInsert;

export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;
export type NewQuizQuestion = typeof quizQuestionsTable.$inferInsert;

export type QuizAttempt = typeof quizAttemptsTable.$inferSelect;
export type NewQuizAttempt = typeof quizAttemptsTable.$inferInsert;

export type StudentAchievement = typeof studentAchievementsTable.$inferSelect;
export type NewStudentAchievement = typeof studentAchievementsTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  students: studentsTable,
  materialSections: materialSectionsTable,
  quizQuestions: quizQuestionsTable,
  quizAttempts: quizAttemptsTable,
  studentAchievements: studentAchievementsTable
};