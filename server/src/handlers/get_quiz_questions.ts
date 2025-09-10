import { db } from '../db';
import { quizQuestionsTable } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { type QuizQuestion } from '../schema';

export const getQuizQuestions = async (questionType: 'quiz' | 'assessment'): Promise<QuizQuestion[]> => {
  try {
    // Fetch questions filtered by type and randomize the order
    const results = await db.select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.question_type, questionType))
      .orderBy(sql`RANDOM()`) // Randomize question order for better learning experience
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch quiz questions:', error);
    throw error;
  }
};