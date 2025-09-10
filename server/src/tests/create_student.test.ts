import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable } from '../db/schema';
import { type CreateStudentInput } from '../schema';
import { createStudent } from '../handlers/create_student';
import { eq } from 'drizzle-orm';

// Test input
const testInput: CreateStudentInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  grade: '10th Grade'
};

describe('createStudent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a student', async () => {
    const result = await createStudent(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.grade).toEqual('10th Grade');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save student to database', async () => {
    const result = await createStudent(testInput);

    // Query database to verify student was saved
    const students = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, result.id))
      .execute();

    expect(students).toHaveLength(1);
    expect(students[0].name).toEqual('John Doe');
    expect(students[0].email).toEqual('john.doe@example.com');
    expect(students[0].grade).toEqual('10th Grade');
    expect(students[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple students with unique emails', async () => {
    const student1Input: CreateStudentInput = {
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      grade: '9th Grade'
    };

    const student2Input: CreateStudentInput = {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      grade: '11th Grade'
    };

    const result1 = await createStudent(student1Input);
    const result2 = await createStudent(student2Input);

    // Verify both students were created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.email).toEqual('alice.smith@example.com');
    expect(result2.email).toEqual('bob.johnson@example.com');

    // Verify both are in database
    const allStudents = await db.select()
      .from(studentsTable)
      .execute();

    expect(allStudents).toHaveLength(2);
  });

  it('should fail when creating student with duplicate email', async () => {
    // Create first student
    await createStudent(testInput);

    // Attempt to create second student with same email
    const duplicateInput: CreateStudentInput = {
      name: 'Jane Doe',
      email: 'john.doe@example.com', // Same email as testInput
      grade: '12th Grade'
    };

    // Should throw error due to unique constraint
    await expect(createStudent(duplicateInput)).rejects.toThrow();
  });

  it('should handle different grade formats', async () => {
    const testCases = [
      { name: 'Student A', email: 'a@example.com', grade: '9' },
      { name: 'Student B', email: 'b@example.com', grade: 'Grade 10' },
      { name: 'Student C', email: 'c@example.com', grade: 'Sophomore' },
      { name: 'Student D', email: 'd@example.com', grade: 'Year 11' }
    ];

    for (const testCase of testCases) {
      const result = await createStudent(testCase);
      expect(result.grade).toEqual(testCase.grade);
      expect(result.name).toEqual(testCase.name);
      expect(result.email).toEqual(testCase.email);
    }

    // Verify all students were created
    const allStudents = await db.select()
      .from(studentsTable)
      .execute();

    expect(allStudents).toHaveLength(4);
  });

  it('should preserve exact input values', async () => {
    const specialInput: CreateStudentInput = {
      name: 'María José García-López',
      email: 'maria.jose.garcia-lopez@universidad.edu.mx',
      grade: 'Preparatoria 3ro'
    };

    const result = await createStudent(specialInput);

    expect(result.name).toEqual(specialInput.name);
    expect(result.email).toEqual(specialInput.email);
    expect(result.grade).toEqual(specialInput.grade);
  });
});