import { db } from '../db';
import { quizAttemptsTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { type QuizAttempt } from '../schema';

interface ScoreCalculationResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  performanceLevel: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
}

export async function calculateStudentScore(
  studentId: number, 
  attemptType: 'quiz' | 'assessment'
): Promise<ScoreCalculationResult> {
  try {
    // Fetch all attempts for the student and attempt type
    const attempts = await db.select()
      .from(quizAttemptsTable)
      .where(
        and(
          eq(quizAttemptsTable.student_id, studentId),
          eq(quizAttemptsTable.attempt_type, attemptType)
        )
      )
      .execute();

    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(attempt => attempt.is_correct).length;
    
    // Calculate percentage (avoid division by zero)
    const scorePercentage = totalQuestions > 0 
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

    // Determine performance level based on percentage
    let performanceLevel: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
    if (scorePercentage >= 90) {
      performanceLevel = 'excellent';
    } else if (scorePercentage >= 70) {
      performanceLevel = 'good';
    } else if (scorePercentage >= 50) {
      performanceLevel = 'satisfactory';
    } else {
      performanceLevel = 'needs_improvement';
    }

    return {
      totalQuestions,
      correctAnswers,
      scorePercentage,
      performanceLevel
    };
  } catch (error) {
    console.error('Score calculation failed:', error);
    throw error;
  }
}