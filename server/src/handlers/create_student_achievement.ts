import { db } from '../db';
import { studentAchievementsTable, studentsTable } from '../db/schema';
import { type CreateStudentAchievementInput, type StudentAchievement } from '../schema';
import { eq } from 'drizzle-orm';

export const createStudentAchievement = async (input: CreateStudentAchievementInput): Promise<StudentAchievement> => {
  try {
    // Verify the student exists before creating achievement
    const studentExists = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, input.student_id))
      .execute();

    if (studentExists.length === 0) {
      throw new Error(`Student with ID ${input.student_id} not found`);
    }

    // Insert the achievement record
    const result = await db.insert(studentAchievementsTable)
      .values({
        student_id: input.student_id,
        quiz_score: input.quiz_score,
        assessment_score: input.assessment_score,
        total_quiz_questions: input.total_quiz_questions,
        correct_quiz_answers: input.correct_quiz_answers,
        total_assessment_questions: input.total_assessment_questions,
        correct_assessment_answers: input.correct_assessment_answers,
        time_spent_minutes: input.time_spent_minutes,
        performance_level: input.performance_level,
        completion_date: new Date()
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Student achievement creation failed:', error);
    throw error;
  }
};