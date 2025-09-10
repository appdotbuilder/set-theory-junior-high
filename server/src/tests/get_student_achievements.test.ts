import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, studentAchievementsTable } from '../db/schema';
import { getStudentAchievements } from '../handlers/get_student_achievements';

describe('getStudentAchievements', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when student has no achievements', async () => {
    // Create a student but no achievements
    const [student] = await db.insert(studentsTable)
      .values({
        name: 'John Doe',
        email: 'john.doe@example.com',
        grade: '10th'
      })
      .returning()
      .execute();

    const results = await getStudentAchievements(student.id);

    expect(results).toEqual([]);
    expect(results).toHaveLength(0);
  });

  it('should return achievements for a specific student', async () => {
    // Create students
    const [student1] = await db.insert(studentsTable)
      .values({
        name: 'Alice Smith',
        email: 'alice@example.com',
        grade: '11th'
      })
      .returning()
      .execute();

    const [student2] = await db.insert(studentsTable)
      .values({
        name: 'Bob Johnson',
        email: 'bob@example.com',
        grade: '10th'
      })
      .returning()
      .execute();

    // Create achievements for both students
    await db.insert(studentAchievementsTable)
      .values([
        {
          student_id: student1.id,
          quiz_score: 85,
          assessment_score: 90,
          total_quiz_questions: 10,
          correct_quiz_answers: 8,
          total_assessment_questions: 15,
          correct_assessment_answers: 13,
          time_spent_minutes: 45,
          performance_level: 'excellent'
        },
        {
          student_id: student2.id,
          quiz_score: 70,
          assessment_score: 75,
          total_quiz_questions: 10,
          correct_quiz_answers: 7,
          total_assessment_questions: 15,
          correct_assessment_answers: 11,
          time_spent_minutes: 60,
          performance_level: 'good'
        }
      ])
      .execute();

    const results = await getStudentAchievements(student1.id);

    expect(results).toHaveLength(1);
    expect(results[0].student_id).toEqual(student1.id);
    expect(results[0].quiz_score).toEqual(85);
    expect(results[0].assessment_score).toEqual(90);
    expect(results[0].performance_level).toEqual('excellent');
    expect(results[0].time_spent_minutes).toEqual(45);
    expect(results[0].id).toBeDefined();
    expect(results[0].completion_date).toBeInstanceOf(Date);
    expect(results[0].created_at).toBeInstanceOf(Date);
  });

  it('should return multiple achievements for a student ordered by completion_date descending', async () => {
    // Create a student
    const [student] = await db.insert(studentsTable)
      .values({
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        grade: '12th'
      })
      .returning()
      .execute();

    // Create multiple achievements with different completion dates
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    await db.insert(studentAchievementsTable)
      .values([
        {
          student_id: student.id,
          quiz_score: 75,
          assessment_score: 80,
          total_quiz_questions: 8,
          correct_quiz_answers: 6,
          total_assessment_questions: 12,
          correct_assessment_answers: 9,
          completion_date: twoDaysAgo, // Oldest
          time_spent_minutes: 30,
          performance_level: 'good'
        },
        {
          student_id: student.id,
          quiz_score: 90,
          assessment_score: 95,
          total_quiz_questions: 10,
          correct_quiz_answers: 9,
          total_assessment_questions: 15,
          correct_assessment_answers: 14,
          completion_date: now, // Newest
          time_spent_minutes: 25,
          performance_level: 'excellent'
        },
        {
          student_id: student.id,
          quiz_score: 80,
          assessment_score: 85,
          total_quiz_questions: 9,
          correct_quiz_answers: 7,
          total_assessment_questions: 14,
          correct_assessment_answers: 12,
          completion_date: yesterday, // Middle
          time_spent_minutes: null,
          performance_level: 'good'
        }
      ])
      .execute();

    const results = await getStudentAchievements(student.id);

    expect(results).toHaveLength(3);
    
    // Verify ordering by completion_date descending (newest first)
    expect(results[0].quiz_score).toEqual(90); // Most recent
    expect(results[1].quiz_score).toEqual(80); // Middle
    expect(results[2].quiz_score).toEqual(75); // Oldest
    
    // Verify dates are in descending order
    expect(results[0].completion_date >= results[1].completion_date).toBe(true);
    expect(results[1].completion_date >= results[2].completion_date).toBe(true);
    
    // Verify all achievements belong to the correct student
    results.forEach(achievement => {
      expect(achievement.student_id).toEqual(student.id);
      expect(achievement.id).toBeDefined();
      expect(achievement.completion_date).toBeInstanceOf(Date);
      expect(achievement.created_at).toBeInstanceOf(Date);
    });
  });

  it('should handle nullable time_spent_minutes correctly', async () => {
    // Create a student
    const [student] = await db.insert(studentsTable)
      .values({
        name: 'Diana Wilson',
        email: 'diana@example.com',
        grade: '9th'
      })
      .returning()
      .execute();

    // Create achievement with null time_spent_minutes
    await db.insert(studentAchievementsTable)
      .values({
        student_id: student.id,
        quiz_score: 65,
        assessment_score: 70,
        total_quiz_questions: 12,
        correct_quiz_answers: 8,
        total_assessment_questions: 18,
        correct_assessment_answers: 13,
        time_spent_minutes: null,
        performance_level: 'satisfactory'
      })
      .execute();

    const results = await getStudentAchievements(student.id);

    expect(results).toHaveLength(1);
    expect(results[0].time_spent_minutes).toBeNull();
    expect(results[0].performance_level).toEqual('satisfactory');
  });

  it('should return empty array for non-existent student', async () => {
    const nonExistentStudentId = 99999;
    
    const results = await getStudentAchievements(nonExistentStudentId);

    expect(results).toEqual([]);
    expect(results).toHaveLength(0);
  });

  it('should handle all performance levels correctly', async () => {
    // Create a student
    const [student] = await db.insert(studentsTable)
      .values({
        name: 'Eva Martinez',
        email: 'eva@example.com',
        grade: '11th'
      })
      .returning()
      .execute();

    // Create achievements with different performance levels
    await db.insert(studentAchievementsTable)
      .values([
        {
          student_id: student.id,
          quiz_score: 95,
          assessment_score: 98,
          total_quiz_questions: 10,
          correct_quiz_answers: 9,
          total_assessment_questions: 15,
          correct_assessment_answers: 14,
          time_spent_minutes: 20,
          performance_level: 'excellent'
        },
        {
          student_id: student.id,
          quiz_score: 75,
          assessment_score: 80,
          total_quiz_questions: 10,
          correct_quiz_answers: 7,
          total_assessment_questions: 15,
          correct_assessment_answers: 12,
          time_spent_minutes: 35,
          performance_level: 'good'
        },
        {
          student_id: student.id,
          quiz_score: 60,
          assessment_score: 65,
          total_quiz_questions: 10,
          correct_quiz_answers: 6,
          total_assessment_questions: 15,
          correct_assessment_answers: 9,
          time_spent_minutes: 40,
          performance_level: 'satisfactory'
        },
        {
          student_id: student.id,
          quiz_score: 45,
          assessment_score: 50,
          total_quiz_questions: 10,
          correct_quiz_answers: 4,
          total_assessment_questions: 15,
          correct_assessment_answers: 7,
          time_spent_minutes: 50,
          performance_level: 'needs_improvement'
        }
      ])
      .execute();

    const results = await getStudentAchievements(student.id);

    expect(results).toHaveLength(4);
    
    // Verify all performance levels are present
    const performanceLevels = results.map(r => r.performance_level).sort();
    expect(performanceLevels).toEqual(['excellent', 'good', 'needs_improvement', 'satisfactory']);
    
    // Verify score ranges match performance levels
    const excellentRecord = results.find(r => r.performance_level === 'excellent');
    expect(excellentRecord?.quiz_score).toEqual(95);
    expect(excellentRecord?.assessment_score).toEqual(98);
    
    const needsImprovementRecord = results.find(r => r.performance_level === 'needs_improvement');
    expect(needsImprovementRecord?.quiz_score).toEqual(45);
    expect(needsImprovementRecord?.assessment_score).toEqual(50);
  });
});