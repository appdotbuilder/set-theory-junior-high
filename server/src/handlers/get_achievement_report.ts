import { db } from '../db';
import { 
  studentsTable, 
  studentAchievementsTable, 
  quizAttemptsTable 
} from '../db/schema';
import { type GetAchievementReportInput, type AchievementReport } from '../schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getAchievementReport(input: GetAchievementReportInput): Promise<AchievementReport | null> {
  try {
    // 1. Fetch student details
    const students = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, input.student_id))
      .execute();

    if (students.length === 0) {
      return null; // Student not found
    }

    const student = students[0];

    // 2. Fetch achievement record (specific or latest)
    let achievements;

    if (input.achievement_id) {
      // Get specific achievement
      achievements = await db.select()
        .from(studentAchievementsTable)
        .where(
          and(
            eq(studentAchievementsTable.student_id, input.student_id),
            eq(studentAchievementsTable.id, input.achievement_id)
          )
        )
        .execute();
    } else {
      // Get latest achievement
      achievements = await db.select()
        .from(studentAchievementsTable)
        .where(eq(studentAchievementsTable.student_id, input.student_id))
        .orderBy(desc(studentAchievementsTable.created_at))
        .limit(1)
        .execute();
    }

    if (achievements.length === 0) {
      return null; // No achievements found
    }

    const achievement = achievements[0];

    // 3. Fetch detailed quiz attempts for this student
    const quizAttempts = await db.select()
      .from(quizAttemptsTable)
      .where(
        and(
          eq(quizAttemptsTable.student_id, input.student_id),
          eq(quizAttemptsTable.attempt_type, 'quiz')
        )
      )
      .execute();

    // 4. Fetch detailed assessment attempts for this student
    const assessmentAttempts = await db.select()
      .from(quizAttemptsTable)
      .where(
        and(
          eq(quizAttemptsTable.student_id, input.student_id),
          eq(quizAttemptsTable.attempt_type, 'assessment')
        )
      )
      .execute();

    // 5. Build and return the comprehensive report
    const report: AchievementReport = {
      student,
      achievement,
      quiz_details: {
        total_questions: achievement.total_quiz_questions,
        correct_answers: achievement.correct_quiz_answers,
        score_percentage: achievement.quiz_score,
        questions_attempted: quizAttempts
      },
      assessment_details: {
        total_questions: achievement.total_assessment_questions,
        correct_answers: achievement.correct_assessment_answers,
        score_percentage: achievement.assessment_score,
        questions_attempted: assessmentAttempts
      }
    };

    return report;
  } catch (error) {
    console.error('Achievement report generation failed:', error);
    throw error;
  }
}