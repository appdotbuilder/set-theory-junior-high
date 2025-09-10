import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, quizQuestionsTable, quizAttemptsTable } from '../db/schema';
import { type SubmitQuizAnswerInput } from '../schema';
import { submitQuizAnswer } from '../handlers/submit_quiz_answer';
import { eq } from 'drizzle-orm';

describe('submitQuizAnswer', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testStudent: { id: number; name: string; email: string; grade: string };
  let testQuestion: { 
    id: number; 
    question_text: string; 
    correct_answer: 'A' | 'B' | 'C' | 'D';
    question_type: 'quiz' | 'assessment';
  };

  beforeEach(async () => {
    // Create a test student
    const studentResult = await db.insert(studentsTable)
      .values({
        name: 'Test Student',
        email: 'test@example.com',
        grade: '10th'
      })
      .returning()
      .execute();
    testStudent = studentResult[0];

    // Create a test quiz question
    const questionResult = await db.insert(quizQuestionsTable)
      .values({
        question_text: 'What is 2 + 2?',
        option_a: '3',
        option_b: '4',
        option_c: '5',
        option_d: '6',
        correct_answer: 'B',
        question_type: 'quiz',
        difficulty_level: 'easy',
        topic: 'Mathematics',
        explanation: 'Basic addition: 2 + 2 = 4'
      })
      .returning()
      .execute();
    testQuestion = questionResult[0];
  });

  it('should submit a correct quiz answer', async () => {
    const input: SubmitQuizAnswerInput = {
      student_id: testStudent.id,
      question_id: testQuestion.id,
      selected_answer: 'B', // Correct answer
      attempt_type: 'quiz'
    };

    const result = await submitQuizAnswer(input);

    expect(result.id).toBeDefined();
    expect(result.student_id).toEqual(testStudent.id);
    expect(result.question_id).toEqual(testQuestion.id);
    expect(result.selected_answer).toEqual('B');
    expect(result.is_correct).toBe(true);
    expect(result.attempt_type).toEqual('quiz');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should submit an incorrect quiz answer', async () => {
    const input: SubmitQuizAnswerInput = {
      student_id: testStudent.id,
      question_id: testQuestion.id,
      selected_answer: 'A', // Incorrect answer
      attempt_type: 'quiz'
    };

    const result = await submitQuizAnswer(input);

    expect(result.id).toBeDefined();
    expect(result.student_id).toEqual(testStudent.id);
    expect(result.question_id).toEqual(testQuestion.id);
    expect(result.selected_answer).toEqual('A');
    expect(result.is_correct).toBe(false);
    expect(result.attempt_type).toEqual('quiz');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should submit an assessment answer', async () => {
    // Create an assessment question
    const assessmentResult = await db.insert(quizQuestionsTable)
      .values({
        question_text: 'What is the capital of France?',
        option_a: 'London',
        option_b: 'Berlin',
        option_c: 'Paris',
        option_d: 'Madrid',
        correct_answer: 'C',
        question_type: 'assessment',
        difficulty_level: 'medium',
        topic: 'Geography',
        explanation: 'Paris is the capital and most populous city of France'
      })
      .returning()
      .execute();

    const input: SubmitQuizAnswerInput = {
      student_id: testStudent.id,
      question_id: assessmentResult[0].id,
      selected_answer: 'C',
      attempt_type: 'assessment'
    };

    const result = await submitQuizAnswer(input);

    expect(result.student_id).toEqual(testStudent.id);
    expect(result.question_id).toEqual(assessmentResult[0].id);
    expect(result.selected_answer).toEqual('C');
    expect(result.is_correct).toBe(true);
    expect(result.attempt_type).toEqual('assessment');
  });

  it('should save quiz attempt to database', async () => {
    const input: SubmitQuizAnswerInput = {
      student_id: testStudent.id,
      question_id: testQuestion.id,
      selected_answer: 'B',
      attempt_type: 'quiz'
    };

    const result = await submitQuizAnswer(input);

    // Verify the attempt was saved to the database
    const attempts = await db.select()
      .from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.id, result.id))
      .execute();

    expect(attempts).toHaveLength(1);
    expect(attempts[0].student_id).toEqual(testStudent.id);
    expect(attempts[0].question_id).toEqual(testQuestion.id);
    expect(attempts[0].selected_answer).toEqual('B');
    expect(attempts[0].is_correct).toBe(true);
    expect(attempts[0].attempt_type).toEqual('quiz');
  });

  it('should throw error for non-existent student', async () => {
    const input: SubmitQuizAnswerInput = {
      student_id: 9999, // Non-existent student ID
      question_id: testQuestion.id,
      selected_answer: 'B',
      attempt_type: 'quiz'
    };

    await expect(submitQuizAnswer(input)).rejects.toThrow(/student.*not found/i);
  });

  it('should throw error for non-existent question', async () => {
    const input: SubmitQuizAnswerInput = {
      student_id: testStudent.id,
      question_id: 9999, // Non-existent question ID
      selected_answer: 'B',
      attempt_type: 'quiz'
    };

    await expect(submitQuizAnswer(input)).rejects.toThrow(/question.*not found/i);
  });

  it('should handle all answer options correctly', async () => {
    const testCases: Array<{
      selected: 'A' | 'B' | 'C' | 'D';
      correct: 'A' | 'B' | 'C' | 'D';
      expectedCorrect: boolean;
    }> = [
      { selected: 'A', correct: 'A', expectedCorrect: true },
      { selected: 'B', correct: 'B', expectedCorrect: true },
      { selected: 'C', correct: 'C', expectedCorrect: true },
      { selected: 'D', correct: 'D', expectedCorrect: true },
      { selected: 'A', correct: 'B', expectedCorrect: false },
      { selected: 'C', correct: 'D', expectedCorrect: false }
    ];

    for (const testCase of testCases) {
      // Create a question with specific correct answer
      const questionResult = await db.insert(quizQuestionsTable)
        .values({
          question_text: `Test question with correct answer ${testCase.correct}`,
          option_a: 'Option A',
          option_b: 'Option B',
          option_c: 'Option C',
          option_d: 'Option D',
          correct_answer: testCase.correct,
          question_type: 'quiz',
          difficulty_level: 'easy',
          topic: 'Test',
          explanation: null
        })
        .returning()
        .execute();

      const input: SubmitQuizAnswerInput = {
        student_id: testStudent.id,
        question_id: questionResult[0].id,
        selected_answer: testCase.selected,
        attempt_type: 'quiz'
      };

      const result = await submitQuizAnswer(input);

      expect(result.is_correct).toBe(testCase.expectedCorrect);
      expect(result.selected_answer).toEqual(testCase.selected);
    }
  });
});