import { db } from '../db';
import { studentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Student } from '../schema';

export async function getStudentById(studentId: number): Promise<Student | null> {
  try {
    const students = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, studentId))
      .limit(1)
      .execute();

    if (students.length === 0) {
      return null;
    }

    return students[0];
  } catch (error) {
    console.error('Failed to get student by ID:', error);
    throw error;
  }
}