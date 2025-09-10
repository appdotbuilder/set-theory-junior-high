import { db } from '../db';
import { studentsTable } from '../db/schema';
import { type Student } from '../schema';
import { desc } from 'drizzle-orm';

export async function getStudents(): Promise<Student[]> {
  try {
    // Fetch all students ordered by creation date (newest first)
    const results = await db.select()
      .from(studentsTable)
      .orderBy(desc(studentsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Get students failed:', error);
    throw error;
  }
}