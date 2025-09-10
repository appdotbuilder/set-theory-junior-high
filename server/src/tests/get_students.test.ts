import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable } from '../db/schema';
import { type CreateStudentInput } from '../schema';
import { getStudents } from '../handlers/get_students';

// Test student inputs
const testStudent1: CreateStudentInput = {
  name: 'Alice Johnson',
  email: 'alice.johnson@example.com',
  grade: '10th Grade'
};

const testStudent2: CreateStudentInput = {
  name: 'Bob Smith',
  email: 'bob.smith@example.com',
  grade: '11th Grade'
};

const testStudent3: CreateStudentInput = {
  name: 'Carol Davis',
  email: 'carol.davis@example.com',
  grade: '9th Grade'
};

describe('getStudents', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no students exist', async () => {
    const result = await getStudents();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all students', async () => {
    // Create test students
    await db.insert(studentsTable)
      .values([
        {
          name: testStudent1.name,
          email: testStudent1.email,
          grade: testStudent1.grade
        },
        {
          name: testStudent2.name,
          email: testStudent2.email,
          grade: testStudent2.grade
        },
        {
          name: testStudent3.name,
          email: testStudent3.email,
          grade: testStudent3.grade
        }
      ])
      .execute();

    const result = await getStudents();

    expect(result).toHaveLength(3);

    // Verify all required fields are present
    result.forEach(student => {
      expect(student.id).toBeDefined();
      expect(typeof student.id).toBe('number');
      expect(student.name).toBeDefined();
      expect(typeof student.name).toBe('string');
      expect(student.email).toBeDefined();
      expect(typeof student.email).toBe('string');
      expect(student.grade).toBeDefined();
      expect(typeof student.grade).toBe('string');
      expect(student.created_at).toBeInstanceOf(Date);
    });

    // Verify specific student data
    const studentNames = result.map(s => s.name);
    expect(studentNames).toContain('Alice Johnson');
    expect(studentNames).toContain('Bob Smith');
    expect(studentNames).toContain('Carol Davis');

    const studentEmails = result.map(s => s.email);
    expect(studentEmails).toContain('alice.johnson@example.com');
    expect(studentEmails).toContain('bob.smith@example.com');
    expect(studentEmails).toContain('carol.davis@example.com');

    const studentGrades = result.map(s => s.grade);
    expect(studentGrades).toContain('10th Grade');
    expect(studentGrades).toContain('11th Grade');
    expect(studentGrades).toContain('9th Grade');
  });

  it('should return students ordered by creation date (newest first)', async () => {
    // Create students with slight delay to ensure different timestamps
    const student1Result = await db.insert(studentsTable)
      .values({
        name: 'First Student',
        email: 'first@example.com',
        grade: '10th Grade'
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const student2Result = await db.insert(studentsTable)
      .values({
        name: 'Second Student',
        email: 'second@example.com',
        grade: '11th Grade'
      })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const student3Result = await db.insert(studentsTable)
      .values({
        name: 'Third Student',
        email: 'third@example.com',
        grade: '12th Grade'
      })
      .returning()
      .execute();

    const result = await getStudents();

    expect(result).toHaveLength(3);

    // Should be ordered by created_at desc (newest first)
    expect(result[0].name).toBe('Third Student');
    expect(result[1].name).toBe('Second Student');
    expect(result[2].name).toBe('First Student');

    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should handle single student correctly', async () => {
    // Insert single student
    await db.insert(studentsTable)
      .values({
        name: testStudent1.name,
        email: testStudent1.email,
        grade: testStudent1.grade
      })
      .execute();

    const result = await getStudents();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice Johnson');
    expect(result[0].email).toBe('alice.johnson@example.com');
    expect(result[0].grade).toBe('10th Grade');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should preserve all student data types correctly', async () => {
    // Create student
    await db.insert(studentsTable)
      .values({
        name: 'Test Student',
        email: 'test@example.com',
        grade: 'Test Grade'
      })
      .execute();

    const result = await getStudents();
    const student = result[0];

    // Verify data types match schema expectations
    expect(typeof student.id).toBe('number');
    expect(typeof student.name).toBe('string');
    expect(typeof student.email).toBe('string');
    expect(typeof student.grade).toBe('string');
    expect(student.created_at).toBeInstanceOf(Date);

    // Verify string fields are not empty
    expect(student.name.length).toBeGreaterThan(0);
    expect(student.email.length).toBeGreaterThan(0);
    expect(student.grade.length).toBeGreaterThan(0);

    // Verify ID is positive integer
    expect(student.id).toBeGreaterThan(0);
    expect(Number.isInteger(student.id)).toBe(true);
  });
});