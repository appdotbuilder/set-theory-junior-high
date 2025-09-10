import { db } from '../db';
import { quizAttemptsTable } from '../db/schema';
import { type QuizAttempt } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function getStudentAttempts(studentId: number, attemptType?: 'quiz' | 'assessment'): Promise<QuizAttempt[]> {
  try {
    // Build conditions array
    const conditions = [eq(quizAttemptsTable.student_id, studentId)];

    // Add attempt type filter if provided
    if (attemptType) {
      conditions.push(eq(quizAttemptsTable.attempt_type, attemptType));
    }

    // Build and execute query in one chain
    const results = await db.select()
      .from(quizAttemptsTable)
      .where(and(...conditions))
      .orderBy(quizAttemptsTable.created_at)
      .execute();

    // Return the results (no numeric conversion needed - all fields are integers or enums)
    return results;
  } catch (error) {
    console.error('Failed to get student attempts:', error);
    throw error;
  }
}