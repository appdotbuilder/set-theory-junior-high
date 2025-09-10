import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createStudentInputSchema,
  createQuizQuestionInputSchema,
  submitQuizAnswerInputSchema,
  createStudentAchievementInputSchema,
  getAchievementReportInputSchema
} from './schema';

// Import handlers
import { createStudent } from './handlers/create_student';
import { getStudents } from './handlers/get_students';
import { getStudentById } from './handlers/get_student_by_id';
import { getMaterialSections } from './handlers/get_material_sections';
import { createMaterialSection } from './handlers/create_material_section';
import { getQuizQuestions } from './handlers/get_quiz_questions';
import { createQuizQuestion } from './handlers/create_quiz_question';
import { submitQuizAnswer } from './handlers/submit_quiz_answer';
import { getStudentAttempts } from './handlers/get_student_attempts';
import { createStudentAchievement } from './handlers/create_student_achievement';
import { getAchievementReport } from './handlers/get_achievement_report';
import { getStudentAchievements } from './handlers/get_student_achievements';
import { calculateStudentScore } from './handlers/calculate_student_score';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Student management
  createStudent: publicProcedure
    .input(createStudentInputSchema)
    .mutation(({ input }) => createStudent(input)),
    
  getStudents: publicProcedure
    .query(() => getStudents()),
    
  getStudentById: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(({ input }) => getStudentById(input.studentId)),

  // Material sections for learning content
  getMaterialSections: publicProcedure
    .query(() => getMaterialSections()),
    
  createMaterialSection: publicProcedure
    .input(z.object({
      title: z.string(),
      content: z.string(),
      topic: z.string(),
      order: z.number().int()
    }))
    .mutation(({ input }) => createMaterialSection(input)),

  // Quiz and assessment questions
  getQuizQuestions: publicProcedure
    .input(z.object({ 
      questionType: z.enum(['quiz', 'assessment']) 
    }))
    .query(({ input }) => getQuizQuestions(input.questionType)),
    
  createQuizQuestion: publicProcedure
    .input(createQuizQuestionInputSchema)
    .mutation(({ input }) => createQuizQuestion(input)),

  // Quiz attempts and answers
  submitQuizAnswer: publicProcedure
    .input(submitQuizAnswerInputSchema)
    .mutation(({ input }) => submitQuizAnswer(input)),
    
  getStudentAttempts: publicProcedure
    .input(z.object({
      studentId: z.number(),
      attemptType: z.enum(['quiz', 'assessment']).optional()
    }))
    .query(({ input }) => getStudentAttempts(input.studentId, input.attemptType)),

  // Score calculation
  calculateStudentScore: publicProcedure
    .input(z.object({
      studentId: z.number(),
      attemptType: z.enum(['quiz', 'assessment'])
    }))
    .query(({ input }) => calculateStudentScore(input.studentId, input.attemptType)),

  // Student achievements and reports
  createStudentAchievement: publicProcedure
    .input(createStudentAchievementInputSchema)
    .mutation(({ input }) => createStudentAchievement(input)),
    
  getStudentAchievements: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(({ input }) => getStudentAchievements(input.studentId)),
    
  getAchievementReport: publicProcedure
    .input(getAchievementReportInputSchema)
    .query(({ input }) => getAchievementReport(input))
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();