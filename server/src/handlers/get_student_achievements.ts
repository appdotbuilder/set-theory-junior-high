import { db } from '../db';
import { studentAchievementsTable } from '../db/schema';
import { type StudentAchievement } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getStudentAchievements = async (studentId: number): Promise<StudentAchievement[]> => {
  try {
    // Query student achievements ordered by completion_date descending (newest first)
    const results = await db.select()
      .from(studentAchievementsTable)
      .where(eq(studentAchievementsTable.student_id, studentId))
      .orderBy(desc(studentAchievementsTable.completion_date))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch student achievements:', error);
    throw error;
  }
};