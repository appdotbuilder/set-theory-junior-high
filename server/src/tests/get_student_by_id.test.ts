import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable } from '../db/schema';
import { type CreateStudentInput } from '../schema';
import { getStudentById } from '../handlers/get_student_by_id';

// Test student data
const testStudent: CreateStudentInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  grade: '10th Grade'
};

const anotherStudent: CreateStudentInput = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  grade: '11th Grade'
};

describe('getStudentById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return student when found', async () => {
    // Create a test student
    const insertResult = await db.insert(studentsTable)
      .values(testStudent)
      .returning()
      .execute();

    const createdStudent = insertResult[0];
    
    // Get student by ID
    const result = await getStudentById(createdStudent.id);

    // Verify returned student data
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdStudent.id);
    expect(result!.name).toEqual('John Doe');
    expect(result!.email).toEqual('john.doe@example.com');
    expect(result!.grade).toEqual('10th Grade');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when student not found', async () => {
    // Try to get non-existent student
    const result = await getStudentById(99999);

    expect(result).toBeNull();
  });

  it('should return correct student when multiple students exist', async () => {
    // Create multiple students
    const students = await db.insert(studentsTable)
      .values([testStudent, anotherStudent])
      .returning()
      .execute();

    const firstStudentId = students[0].id;
    const secondStudentId = students[1].id;

    // Get first student
    const firstResult = await getStudentById(firstStudentId);
    expect(firstResult).not.toBeNull();
    expect(firstResult!.id).toEqual(firstStudentId);
    expect(firstResult!.name).toEqual('John Doe');
    expect(firstResult!.email).toEqual('john.doe@example.com');

    // Get second student
    const secondResult = await getStudentById(secondStudentId);
    expect(secondResult).not.toBeNull();
    expect(secondResult!.id).toEqual(secondStudentId);
    expect(secondResult!.name).toEqual('Jane Smith');
    expect(secondResult!.email).toEqual('jane.smith@example.com');
  });

  it('should handle edge case with ID 0', async () => {
    // Try to get student with ID 0 (should not exist in serial primary key)
    const result = await getStudentById(0);

    expect(result).toBeNull();
  });

  it('should handle negative ID gracefully', async () => {
    // Try to get student with negative ID
    const result = await getStudentById(-1);

    expect(result).toBeNull();
  });
});