import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, quizQuestionsTable, quizAttemptsTable } from '../db/schema';
import { getStudentAttempts } from '../handlers/get_student_attempts';
import { eq } from 'drizzle-orm';

describe('getStudentAttempts', () => {
  let testStudentId: number;
  let testQuestionId: number;

  beforeEach(async () => {
    await createDB();

    // Create a test student
    const studentResult = await db.insert(studentsTable)
      .values({
        name: 'Test Student',
        email: 'test@example.com',
        grade: '10th Grade'
      })
      .returning()
      .execute();
    testStudentId = studentResult[0].id;

    // Create a test question
    const questionResult = await db.insert(quizQuestionsTable)
      .values({
        question_text: 'What is 2+2?',
        option_a: '3',
        option_b: '4',
        option_c: '5',
        option_d: '6',
        correct_answer: 'B',
        question_type: 'quiz',
        difficulty_level: 'easy',
        topic: 'Math',
        explanation: 'Basic addition'
      })
      .returning()
      .execute();
    testQuestionId = questionResult[0].id;
  });

  afterEach(resetDB);

  it('should get all attempts for a student', async () => {
    // Create quiz attempts
    await db.insert(quizAttemptsTable)
      .values([
        {
          student_id: testStudentId,
          question_id: testQuestionId,
          selected_answer: 'B',
          is_correct: true,
          attempt_type: 'quiz'
        },
        {
          student_id: testStudentId,
          question_id: testQuestionId,
          selected_answer: 'A',
          is_correct: false,
          attempt_type: 'assessment'
        }
      ])
      .execute();

    const results = await getStudentAttempts(testStudentId);

    expect(results).toHaveLength(2);
    expect(results[0].student_id).toBe(testStudentId);
    expect(results[0].selected_answer).toBe('B');
    expect(results[0].is_correct).toBe(true);
    expect(results[0].attempt_type).toBe('quiz');
    expect(results[0].created_at).toBeInstanceOf(Date);

    expect(results[1].student_id).toBe(testStudentId);
    expect(results[1].selected_answer).toBe('A');
    expect(results[1].is_correct).toBe(false);
    expect(results[1].attempt_type).toBe('assessment');
  });

  it('should filter by quiz attempt type', async () => {
    // Create both quiz and assessment attempts
    await db.insert(quizAttemptsTable)
      .values([
        {
          student_id: testStudentId,
          question_id: testQuestionId,
          selected_answer: 'B',
          is_correct: true,
          attempt_type: 'quiz'
        },
        {
          student_id: testStudentId,
          question_id: testQuestionId,
          selected_answer: 'A',
          is_correct: false,
          attempt_type: 'assessment'
        }
      ])
      .execute();

    const results = await getStudentAttempts(testStudentId, 'quiz');

    expect(results).toHaveLength(1);
    expect(results[0].attempt_type).toBe('quiz');
    expect(results[0].selected_answer).toBe('B');
    expect(results[0].is_correct).toBe(true);
  });

  it('should filter by assessment attempt type', async () => {
    // Create both quiz and assessment attempts
    await db.insert(quizAttemptsTable)
      .values([
        {
          student_id: testStudentId,
          question_id: testQuestionId,
          selected_answer: 'B',
          is_correct: true,
          attempt_type: 'quiz'
        },
        {
          student_id: testStudentId,
          question_id: testQuestionId,
          selected_answer: 'C',
          is_correct: false,
          attempt_type: 'assessment'
        }
      ])
      .execute();

    const results = await getStudentAttempts(testStudentId, 'assessment');

    expect(results).toHaveLength(1);
    expect(results[0].attempt_type).toBe('assessment');
    expect(results[0].selected_answer).toBe('C');
    expect(results[0].is_correct).toBe(false);
  });

  it('should return empty array for student with no attempts', async () => {
    const results = await getStudentAttempts(testStudentId);

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return empty array for non-existent student', async () => {
    const nonExistentStudentId = 99999;
    const results = await getStudentAttempts(nonExistentStudentId);

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return attempts ordered by creation date', async () => {
    // Create multiple attempts with slight delay
    const attempt1 = await db.insert(quizAttemptsTable)
      .values({
        student_id: testStudentId,
        question_id: testQuestionId,
        selected_answer: 'A',
        is_correct: false,
        attempt_type: 'quiz'
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1));

    const attempt2 = await db.insert(quizAttemptsTable)
      .values({
        student_id: testStudentId,
        question_id: testQuestionId,
        selected_answer: 'B',
        is_correct: true,
        attempt_type: 'quiz'
      })
      .returning()
      .execute();

    const results = await getStudentAttempts(testStudentId);

    expect(results).toHaveLength(2);
    // Results should be ordered by created_at (oldest first based on orderBy)
    expect(results[0].created_at.getTime()).toBeLessThanOrEqual(results[1].created_at.getTime());
    expect(results[0].id).toBe(attempt1[0].id);
    expect(results[1].id).toBe(attempt2[0].id);
  });

  it('should only return attempts for specified student', async () => {
    // Create another student
    const anotherStudentResult = await db.insert(studentsTable)
      .values({
        name: 'Another Student',
        email: 'another@example.com',
        grade: '11th Grade'
      })
      .returning()
      .execute();
    const anotherStudentId = anotherStudentResult[0].id;

    // Create attempts for both students
    await db.insert(quizAttemptsTable)
      .values([
        {
          student_id: testStudentId,
          question_id: testQuestionId,
          selected_answer: 'B',
          is_correct: true,
          attempt_type: 'quiz'
        },
        {
          student_id: anotherStudentId,
          question_id: testQuestionId,
          selected_answer: 'A',
          is_correct: false,
          attempt_type: 'quiz'
        }
      ])
      .execute();

    const results = await getStudentAttempts(testStudentId);

    expect(results).toHaveLength(1);
    expect(results[0].student_id).toBe(testStudentId);
    expect(results[0].selected_answer).toBe('B');
  });

  it('should handle multiple questions and attempts correctly', async () => {
    // Create another question
    const question2Result = await db.insert(quizQuestionsTable)
      .values({
        question_text: 'What is 3+3?',
        option_a: '5',
        option_b: '6',
        option_c: '7',
        option_d: '8',
        correct_answer: 'B',
        question_type: 'assessment',
        difficulty_level: 'medium',
        topic: 'Math',
        explanation: null
      })
      .returning()
      .execute();
    const testQuestion2Id = question2Result[0].id;

    // Create attempts for different questions
    await db.insert(quizAttemptsTable)
      .values([
        {
          student_id: testStudentId,
          question_id: testQuestionId,
          selected_answer: 'B',
          is_correct: true,
          attempt_type: 'quiz'
        },
        {
          student_id: testStudentId,
          question_id: testQuestion2Id,
          selected_answer: 'B',
          is_correct: true,
          attempt_type: 'assessment'
        }
      ])
      .execute();

    const allResults = await getStudentAttempts(testStudentId);
    expect(allResults).toHaveLength(2);

    const quizResults = await getStudentAttempts(testStudentId, 'quiz');
    expect(quizResults).toHaveLength(1);
    expect(quizResults[0].question_id).toBe(testQuestionId);

    const assessmentResults = await getStudentAttempts(testStudentId, 'assessment');
    expect(assessmentResults).toHaveLength(1);
    expect(assessmentResults[0].question_id).toBe(testQuestion2Id);
  });
});