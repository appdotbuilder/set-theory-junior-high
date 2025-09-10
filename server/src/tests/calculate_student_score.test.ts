import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, quizQuestionsTable, quizAttemptsTable } from '../db/schema';
import { calculateStudentScore } from '../handlers/calculate_student_score';

describe('calculateStudentScore', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should calculate perfect score (100%)', async () => {
    // Create test student
    const [student] = await db.insert(studentsTable).values({
      name: 'Test Student',
      email: 'test@example.com',
      grade: '10th'
    }).returning().execute();

    // Create test questions
    const questions = await db.insert(quizQuestionsTable).values([
      {
        question_text: 'Question 1',
        option_a: 'A1',
        option_b: 'B1',
        option_c: 'C1',
        option_d: 'D1',
        correct_answer: 'A',
        question_type: 'quiz',
        difficulty_level: 'easy',
        topic: 'Math',
        explanation: 'Test explanation'
      },
      {
        question_text: 'Question 2',
        option_a: 'A2',
        option_b: 'B2',
        option_c: 'C2',
        option_d: 'D2',
        correct_answer: 'B',
        question_type: 'quiz',
        difficulty_level: 'medium',
        topic: 'Math',
        explanation: 'Test explanation'
      }
    ]).returning().execute();

    // Create quiz attempts - all correct
    await db.insert(quizAttemptsTable).values([
      {
        student_id: student.id,
        question_id: questions[0].id,
        selected_answer: 'A',
        is_correct: true,
        attempt_type: 'quiz'
      },
      {
        student_id: student.id,
        question_id: questions[1].id,
        selected_answer: 'B',
        is_correct: true,
        attempt_type: 'quiz'
      }
    ]).execute();

    const result = await calculateStudentScore(student.id, 'quiz');

    expect(result.totalQuestions).toEqual(2);
    expect(result.correctAnswers).toEqual(2);
    expect(result.scorePercentage).toEqual(100);
    expect(result.performanceLevel).toEqual('excellent');
  });

  it('should calculate partial score and determine good performance (75%)', async () => {
    // Create test student
    const [student] = await db.insert(studentsTable).values({
      name: 'Test Student',
      email: 'test@example.com',
      grade: '10th'
    }).returning().execute();

    // Create test questions
    const questions = await db.insert(quizQuestionsTable).values([
      {
        question_text: 'Question 1',
        option_a: 'A1',
        option_b: 'B1',
        option_c: 'C1',
        option_d: 'D1',
        correct_answer: 'A',
        question_type: 'assessment',
        difficulty_level: 'easy',
        topic: 'Science',
        explanation: null
      },
      {
        question_text: 'Question 2',
        option_a: 'A2',
        option_b: 'B2',
        option_c: 'C2',
        option_d: 'D2',
        correct_answer: 'B',
        question_type: 'assessment',
        difficulty_level: 'medium',
        topic: 'Science',
        explanation: null
      },
      {
        question_text: 'Question 3',
        option_a: 'A3',
        option_b: 'B3',
        option_c: 'C3',
        option_d: 'D3',
        correct_answer: 'C',
        question_type: 'assessment',
        difficulty_level: 'hard',
        topic: 'Science',
        explanation: null
      },
      {
        question_text: 'Question 4',
        option_a: 'A4',
        option_b: 'B4',
        option_c: 'C4',
        option_d: 'D4',
        correct_answer: 'D',
        question_type: 'assessment',
        difficulty_level: 'medium',
        topic: 'Science',
        explanation: null
      }
    ]).returning().execute();

    // Create assessment attempts - 3 correct, 1 incorrect
    await db.insert(quizAttemptsTable).values([
      {
        student_id: student.id,
        question_id: questions[0].id,
        selected_answer: 'A',
        is_correct: true,
        attempt_type: 'assessment'
      },
      {
        student_id: student.id,
        question_id: questions[1].id,
        selected_answer: 'B',
        is_correct: true,
        attempt_type: 'assessment'
      },
      {
        student_id: student.id,
        question_id: questions[2].id,
        selected_answer: 'C',
        is_correct: true,
        attempt_type: 'assessment'
      },
      {
        student_id: student.id,
        question_id: questions[3].id,
        selected_answer: 'A', // Wrong answer
        is_correct: false,
        attempt_type: 'assessment'
      }
    ]).execute();

    const result = await calculateStudentScore(student.id, 'assessment');

    expect(result.totalQuestions).toEqual(4);
    expect(result.correctAnswers).toEqual(3);
    expect(result.scorePercentage).toEqual(75);
    expect(result.performanceLevel).toEqual('good');
  });

  it('should handle satisfactory performance (60%)', async () => {
    // Create test student
    const [student] = await db.insert(studentsTable).values({
      name: 'Test Student',
      email: 'test@example.com',
      grade: '9th'
    }).returning().execute();

    // Create test questions
    const questions = await db.insert(quizQuestionsTable).values([
      {
        question_text: 'Question 1',
        option_a: 'A1',
        option_b: 'B1',
        option_c: 'C1',
        option_d: 'D1',
        correct_answer: 'A',
        question_type: 'quiz',
        difficulty_level: 'easy',
        topic: 'History',
        explanation: 'Test explanation'
      },
      {
        question_text: 'Question 2',
        option_a: 'A2',
        option_b: 'B2',
        option_c: 'C2',
        option_d: 'D2',
        correct_answer: 'B',
        question_type: 'quiz',
        difficulty_level: 'medium',
        topic: 'History',
        explanation: 'Test explanation'
      },
      {
        question_text: 'Question 3',
        option_a: 'A3',
        option_b: 'B3',
        option_c: 'C3',
        option_d: 'D3',
        correct_answer: 'C',
        question_type: 'quiz',
        difficulty_level: 'hard',
        topic: 'History',
        explanation: 'Test explanation'
      },
      {
        question_text: 'Question 4',
        option_a: 'A4',
        option_b: 'B4',
        option_c: 'C4',
        option_d: 'D4',
        correct_answer: 'D',
        question_type: 'quiz',
        difficulty_level: 'medium',
        topic: 'History',
        explanation: 'Test explanation'
      },
      {
        question_text: 'Question 5',
        option_a: 'A5',
        option_b: 'B5',
        option_c: 'C5',
        option_d: 'D5',
        correct_answer: 'A',
        question_type: 'quiz',
        difficulty_level: 'easy',
        topic: 'History',
        explanation: 'Test explanation'
      }
    ]).returning().execute();

    // Create quiz attempts - 3 correct, 2 incorrect (60%)
    await db.insert(quizAttemptsTable).values([
      {
        student_id: student.id,
        question_id: questions[0].id,
        selected_answer: 'A',
        is_correct: true,
        attempt_type: 'quiz'
      },
      {
        student_id: student.id,
        question_id: questions[1].id,
        selected_answer: 'B',
        is_correct: true,
        attempt_type: 'quiz'
      },
      {
        student_id: student.id,
        question_id: questions[2].id,
        selected_answer: 'A', // Wrong answer
        is_correct: false,
        attempt_type: 'quiz'
      },
      {
        student_id: student.id,
        question_id: questions[3].id,
        selected_answer: 'A', // Wrong answer
        is_correct: false,
        attempt_type: 'quiz'
      },
      {
        student_id: student.id,
        question_id: questions[4].id,
        selected_answer: 'A',
        is_correct: true,
        attempt_type: 'quiz'
      }
    ]).execute();

    const result = await calculateStudentScore(student.id, 'quiz');

    expect(result.totalQuestions).toEqual(5);
    expect(result.correctAnswers).toEqual(3);
    expect(result.scorePercentage).toEqual(60);
    expect(result.performanceLevel).toEqual('satisfactory');
  });

  it('should handle needs improvement performance (25%)', async () => {
    // Create test student
    const [student] = await db.insert(studentsTable).values({
      name: 'Test Student',
      email: 'test@example.com',
      grade: '8th'
    }).returning().execute();

    // Create test questions
    const questions = await db.insert(quizQuestionsTable).values([
      {
        question_text: 'Question 1',
        option_a: 'A1',
        option_b: 'B1',
        option_c: 'C1',
        option_d: 'D1',
        correct_answer: 'A',
        question_type: 'assessment',
        difficulty_level: 'easy',
        topic: 'Geography',
        explanation: null
      },
      {
        question_text: 'Question 2',
        option_a: 'A2',
        option_b: 'B2',
        option_c: 'C2',
        option_d: 'D2',
        correct_answer: 'B',
        question_type: 'assessment',
        difficulty_level: 'medium',
        topic: 'Geography',
        explanation: null
      },
      {
        question_text: 'Question 3',
        option_a: 'A3',
        option_b: 'B3',
        option_c: 'C3',
        option_d: 'D3',
        correct_answer: 'C',
        question_type: 'assessment',
        difficulty_level: 'hard',
        topic: 'Geography',
        explanation: null
      },
      {
        question_text: 'Question 4',
        option_a: 'A4',
        option_b: 'B4',
        option_c: 'C4',
        option_d: 'D4',
        correct_answer: 'D',
        question_type: 'assessment',
        difficulty_level: 'medium',
        topic: 'Geography',
        explanation: null
      }
    ]).returning().execute();

    // Create assessment attempts - 1 correct, 3 incorrect (25%)
    await db.insert(quizAttemptsTable).values([
      {
        student_id: student.id,
        question_id: questions[0].id,
        selected_answer: 'A',
        is_correct: true,
        attempt_type: 'assessment'
      },
      {
        student_id: student.id,
        question_id: questions[1].id,
        selected_answer: 'A', // Wrong answer
        is_correct: false,
        attempt_type: 'assessment'
      },
      {
        student_id: student.id,
        question_id: questions[2].id,
        selected_answer: 'A', // Wrong answer
        is_correct: false,
        attempt_type: 'assessment'
      },
      {
        student_id: student.id,
        question_id: questions[3].id,
        selected_answer: 'A', // Wrong answer
        is_correct: false,
        attempt_type: 'assessment'
      }
    ]).execute();

    const result = await calculateStudentScore(student.id, 'assessment');

    expect(result.totalQuestions).toEqual(4);
    expect(result.correctAnswers).toEqual(1);
    expect(result.scorePercentage).toEqual(25);
    expect(result.performanceLevel).toEqual('needs_improvement');
  });

  it('should handle edge case with no attempts', async () => {
    // Create test student
    const [student] = await db.insert(studentsTable).values({
      name: 'Test Student',
      email: 'test@example.com',
      grade: '7th'
    }).returning().execute();

    const result = await calculateStudentScore(student.id, 'quiz');

    expect(result.totalQuestions).toEqual(0);
    expect(result.correctAnswers).toEqual(0);
    expect(result.scorePercentage).toEqual(0);
    expect(result.performanceLevel).toEqual('needs_improvement');
  });

  it('should filter by attempt type correctly', async () => {
    // Create test student
    const [student] = await db.insert(studentsTable).values({
      name: 'Test Student',
      email: 'test@example.com',
      grade: '11th'
    }).returning().execute();

    // Create test questions
    const questions = await db.insert(quizQuestionsTable).values([
      {
        question_text: 'Question 1',
        option_a: 'A1',
        option_b: 'B1',
        option_c: 'C1',
        option_d: 'D1',
        correct_answer: 'A',
        question_type: 'quiz',
        difficulty_level: 'easy',
        topic: 'Math',
        explanation: 'Test explanation'
      },
      {
        question_text: 'Question 2',
        option_a: 'A2',
        option_b: 'B2',
        option_c: 'C2',
        option_d: 'D2',
        correct_answer: 'B',
        question_type: 'assessment',
        difficulty_level: 'medium',
        topic: 'Math',
        explanation: null
      }
    ]).returning().execute();

    // Create both quiz and assessment attempts
    await db.insert(quizAttemptsTable).values([
      {
        student_id: student.id,
        question_id: questions[0].id,
        selected_answer: 'A',
        is_correct: true,
        attempt_type: 'quiz'
      },
      {
        student_id: student.id,
        question_id: questions[1].id,
        selected_answer: 'A', // Wrong answer
        is_correct: false,
        attempt_type: 'assessment'
      }
    ]).execute();

    // Test quiz calculation - should only count quiz attempts
    const quizResult = await calculateStudentScore(student.id, 'quiz');
    expect(quizResult.totalQuestions).toEqual(1);
    expect(quizResult.correctAnswers).toEqual(1);
    expect(quizResult.scorePercentage).toEqual(100);
    expect(quizResult.performanceLevel).toEqual('excellent');

    // Test assessment calculation - should only count assessment attempts
    const assessmentResult = await calculateStudentScore(student.id, 'assessment');
    expect(assessmentResult.totalQuestions).toEqual(1);
    expect(assessmentResult.correctAnswers).toEqual(0);
    expect(assessmentResult.scorePercentage).toEqual(0);
    expect(assessmentResult.performanceLevel).toEqual('needs_improvement');
  });

  it('should test performance level boundaries', async () => {
    // Create test student
    const [student] = await db.insert(studentsTable).values({
      name: 'Test Student',
      email: 'test@example.com',
      grade: '12th'
    }).returning().execute();

    // Create 10 test questions for precise percentage testing
    const questionData = Array.from({ length: 10 }, (_, i) => ({
      question_text: `Question ${i + 1}`,
      option_a: `A${i + 1}`,
      option_b: `B${i + 1}`,
      option_c: `C${i + 1}`,
      option_d: `D${i + 1}`,
      correct_answer: 'A' as const,
      question_type: 'quiz' as const,
      difficulty_level: 'easy' as const,
      topic: 'Test',
      explanation: 'Test explanation'
    }));

    const questions = await db.insert(quizQuestionsTable)
      .values(questionData)
      .returning()
      .execute();

    // Test boundary: exactly 90% (9/10 correct) - should be excellent
    await db.delete(quizAttemptsTable).execute(); // Clear any existing attempts
    const attemptData90 = questions.map((q, i) => ({
      student_id: student.id,
      question_id: q.id,
      selected_answer: 'A' as const,
      is_correct: i < 9, // First 9 correct, last one wrong
      attempt_type: 'quiz' as const
    }));

    await db.insert(quizAttemptsTable).values(attemptData90).execute();
    const result90 = await calculateStudentScore(student.id, 'quiz');
    expect(result90.scorePercentage).toEqual(90);
    expect(result90.performanceLevel).toEqual('excellent');

    // Test boundary: exactly 70% (7/10 correct) - should be good
    await db.delete(quizAttemptsTable).execute();
    const attemptData70 = questions.map((q, i) => ({
      student_id: student.id,
      question_id: q.id,
      selected_answer: 'A' as const,
      is_correct: i < 7, // First 7 correct, last 3 wrong
      attempt_type: 'quiz' as const
    }));

    await db.insert(quizAttemptsTable).values(attemptData70).execute();
    const result70 = await calculateStudentScore(student.id, 'quiz');
    expect(result70.scorePercentage).toEqual(70);
    expect(result70.performanceLevel).toEqual('good');

    // Test boundary: exactly 50% (5/10 correct) - should be satisfactory
    await db.delete(quizAttemptsTable).execute();
    const attemptData50 = questions.map((q, i) => ({
      student_id: student.id,
      question_id: q.id,
      selected_answer: 'A' as const,
      is_correct: i < 5, // First 5 correct, last 5 wrong
      attempt_type: 'quiz' as const
    }));

    await db.insert(quizAttemptsTable).values(attemptData50).execute();
    const result50 = await calculateStudentScore(student.id, 'quiz');
    expect(result50.scorePercentage).toEqual(50);
    expect(result50.performanceLevel).toEqual('satisfactory');
  });
});