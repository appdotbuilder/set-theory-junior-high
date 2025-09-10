import { db } from '../db';
import { studentsTable } from '../db/schema';
import { type CreateStudentInput, type Student } from '../schema';

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  try {
    // Insert student record
    const result = await db.insert(studentsTable)
      .values({
        name: input.name,
        email: input.email,
        grade: input.grade
      })
      .returning()
      .execute();

    // Return the created student
    return result[0];
  } catch (error) {
    console.error('Student creation failed:', error);
    throw error;
  }
}