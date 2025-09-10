import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentAchievementsTable, studentsTable } from '../db/schema';
import { type CreateStudentAchievementInput } from '../schema';
import { createStudentAchievement } from '../handlers/create_student_achievement';
import { eq } from 'drizzle-orm';

// Test data
const testStudent = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  grade: '10th'
};

const testAchievementInput: CreateStudentAchievementInput = {
  student_id: 1, // Will be set dynamically in tests
  quiz_score: 85,
  assessment_score: 92,
  total_quiz_questions: 10,
  correct_quiz_answers: 8,
  total_assessment_questions: 20,
  correct_assessment_answers: 18,
  time_spent_minutes: 45,
  performance_level: 'excellent'
};

describe('createStudentAchievement', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a student achievement record', async () => {
    // Create a student first
    const studentResult = await db.insert(studentsTable)
      .values(testStudent)
      .returning()
      .execute();
    
    const student = studentResult[0];
    const input = { ...testAchievementInput, student_id: student.id };

    const result = await createStudentAchievement(input);

    // Verify basic fields
    expect(result.student_id).toEqual(student.id);
    expect(result.quiz_score).toEqual(85);
    expect(result.assessment_score).toEqual(92);
    expect(result.total_quiz_questions).toEqual(10);
    expect(result.correct_quiz_answers).toEqual(8);
    expect(result.total_assessment_questions).toEqual(20);
    expect(result.correct_assessment_answers).toEqual(18);
    expect(result.time_spent_minutes).toEqual(45);
    expect(result.performance_level).toEqual('excellent');
    expect(result.id).toBeDefined();
    expect(result.completion_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save achievement to database', async () => {
    // Create a student first
    const studentResult = await db.insert(studentsTable)
      .values(testStudent)
      .returning()
      .execute();
    
    const student = studentResult[0];
    const input = { ...testAchievementInput, student_id: student.id };

    const result = await createStudentAchievement(input);

    // Query the database to verify the record was saved
    const achievements = await db.select()
      .from(studentAchievementsTable)
      .where(eq(studentAchievementsTable.id, result.id))
      .execute();

    expect(achievements).toHaveLength(1);
    const savedAchievement = achievements[0];
    expect(savedAchievement.student_id).toEqual(student.id);
    expect(savedAchievement.quiz_score).toEqual(85);
    expect(savedAchievement.assessment_score).toEqual(92);
    expect(savedAchievement.performance_level).toEqual('excellent');
    expect(savedAchievement.completion_date).toBeInstanceOf(Date);
    expect(savedAchievement.created_at).toBeInstanceOf(Date);
  });

  it('should handle null time_spent_minutes', async () => {
    // Create a student first
    const studentResult = await db.insert(studentsTable)
      .values(testStudent)
      .returning()
      .execute();
    
    const student = studentResult[0];
    const input = { 
      ...testAchievementInput, 
      student_id: student.id,
      time_spent_minutes: null 
    };

    const result = await createStudentAchievement(input);

    expect(result.time_spent_minutes).toBeNull();
    expect(result.student_id).toEqual(student.id);
    expect(result.quiz_score).toEqual(85);
  });

  it('should handle different performance levels', async () => {
    // Create a student first
    const studentResult = await db.insert(studentsTable)
      .values(testStudent)
      .returning()
      .execute();
    
    const student = studentResult[0];

    // Test each performance level
    const performanceLevels = ['excellent', 'good', 'satisfactory', 'needs_improvement'] as const;
    
    for (const level of performanceLevels) {
      const input = { 
        ...testAchievementInput, 
        student_id: student.id,
        performance_level: level
      };

      const result = await createStudentAchievement(input);
      expect(result.performance_level).toEqual(level);
    }
  });

  it('should throw error when student does not exist', async () => {
    const input = { ...testAchievementInput, student_id: 999 };

    await expect(createStudentAchievement(input))
      .rejects.toThrow(/student with id 999 not found/i);
  });

  it('should handle edge case scores', async () => {
    // Create a student first
    const studentResult = await db.insert(studentsTable)
      .values(testStudent)
      .returning()
      .execute();
    
    const student = studentResult[0];

    // Test minimum scores
    const minInput = {
      ...testAchievementInput,
      student_id: student.id,
      quiz_score: 0,
      assessment_score: 0,
      correct_quiz_answers: 0,
      correct_assessment_answers: 0,
      performance_level: 'needs_improvement' as const
    };

    const minResult = await createStudentAchievement(minInput);
    expect(minResult.quiz_score).toEqual(0);
    expect(minResult.assessment_score).toEqual(0);
    expect(minResult.correct_quiz_answers).toEqual(0);
    expect(minResult.correct_assessment_answers).toEqual(0);

    // Test maximum scores
    const maxInput = {
      ...testAchievementInput,
      student_id: student.id,
      quiz_score: 100,
      assessment_score: 100,
      performance_level: 'excellent' as const
    };

    const maxResult = await createStudentAchievement(maxInput);
    expect(maxResult.quiz_score).toEqual(100);
    expect(maxResult.assessment_score).toEqual(100);
    expect(maxResult.performance_level).toEqual('excellent');
  });

  it('should create multiple achievements for same student', async () => {
    // Create a student first
    const studentResult = await db.insert(studentsTable)
      .values(testStudent)
      .returning()
      .execute();
    
    const student = studentResult[0];

    // Create first achievement
    const input1 = { ...testAchievementInput, student_id: student.id };
    const result1 = await createStudentAchievement(input1);

    // Create second achievement with different scores
    const input2 = { 
      ...testAchievementInput, 
      student_id: student.id,
      quiz_score: 75,
      assessment_score: 88,
      performance_level: 'good' as const
    };
    const result2 = await createStudentAchievement(input2);

    // Verify both achievements exist
    const achievements = await db.select()
      .from(studentAchievementsTable)
      .where(eq(studentAchievementsTable.student_id, student.id))
      .execute();

    expect(achievements).toHaveLength(2);
    expect(achievements[0].id).toEqual(result1.id);
    expect(achievements[1].id).toEqual(result2.id);
    expect(achievements[0].quiz_score).toEqual(85);
    expect(achievements[1].quiz_score).toEqual(75);
  });
});