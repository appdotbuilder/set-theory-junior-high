import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  studentsTable, 
  studentAchievementsTable, 
  quizAttemptsTable,
  quizQuestionsTable
} from '../db/schema';
import { type GetAchievementReportInput } from '../schema';
import { getAchievementReport } from '../handlers/get_achievement_report';

describe('getAchievementReport', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when student does not exist', async () => {
    const input: GetAchievementReportInput = {
      student_id: 999
    };

    const result = await getAchievementReport(input);
    expect(result).toBeNull();
  });

  it('should return null when student exists but has no achievements', async () => {
    // Create a student with no achievements
    const students = await db.insert(studentsTable)
      .values({
        name: 'Test Student',
        email: 'test@example.com',
        grade: '10th'
      })
      .returning()
      .execute();

    const input: GetAchievementReportInput = {
      student_id: students[0].id
    };

    const result = await getAchievementReport(input);
    expect(result).toBeNull();
  });

  it('should return latest achievement report when no achievement_id specified', async () => {
    // Create student
    const students = await db.insert(studentsTable)
      .values({
        name: 'John Doe',
        email: 'john@example.com',
        grade: '10th'
      })
      .returning()
      .execute();

    const student = students[0];

    // Create quiz questions for testing
    const quizQuestions = await db.insert(quizQuestionsTable)
      .values([
        {
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
        },
        {
          question_text: 'What is the capital of France?',
          option_a: 'London',
          option_b: 'Berlin',
          option_c: 'Paris',
          option_d: 'Madrid',
          correct_answer: 'C',
          question_type: 'assessment',
          difficulty_level: 'medium',
          topic: 'Geography',
          explanation: 'Paris is the capital of France'
        }
      ])
      .returning()
      .execute();

    // Create first achievement
    await db.insert(studentAchievementsTable)
      .values({
        student_id: student.id,
        quiz_score: 75,
        assessment_score: 80,
        total_quiz_questions: 10,
        correct_quiz_answers: 7,
        total_assessment_questions: 5,
        correct_assessment_answers: 4,
        performance_level: 'good',
        time_spent_minutes: 45
      })
      .execute();

    // Add small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second achievement (should be latest)
    const achievements = await db.insert(studentAchievementsTable)
      .values({
        student_id: student.id,
        quiz_score: 90,
        assessment_score: 95,
        total_quiz_questions: 12,
        correct_quiz_answers: 11,
        total_assessment_questions: 8,
        correct_assessment_answers: 7,
        performance_level: 'excellent',
        time_spent_minutes: 60
      })
      .returning()
      .execute();

    // Create quiz attempts
    await db.insert(quizAttemptsTable)
      .values([
        {
          student_id: student.id,
          question_id: quizQuestions[0].id,
          selected_answer: 'B',
          is_correct: true,
          attempt_type: 'quiz'
        },
        {
          student_id: student.id,
          question_id: quizQuestions[1].id,
          selected_answer: 'C',
          is_correct: true,
          attempt_type: 'assessment'
        }
      ])
      .execute();

    const input: GetAchievementReportInput = {
      student_id: student.id
    };

    const result = await getAchievementReport(input);

    expect(result).not.toBeNull();
    expect(result!.student.id).toBe(student.id);
    expect(result!.student.name).toBe('John Doe');
    expect(result!.student.email).toBe('john@example.com');
    expect(result!.student.grade).toBe('10th');

    // Should return the latest achievement (second one)
    expect(result!.achievement.quiz_score).toBe(90);
    expect(result!.achievement.assessment_score).toBe(95);
    expect(result!.achievement.performance_level).toBe('excellent');
    expect(result!.achievement.time_spent_minutes).toBe(60);

    // Check quiz details
    expect(result!.quiz_details.total_questions).toBe(12);
    expect(result!.quiz_details.correct_answers).toBe(11);
    expect(result!.quiz_details.score_percentage).toBe(90);
    expect(result!.quiz_details.questions_attempted).toHaveLength(1);
    expect(result!.quiz_details.questions_attempted[0].attempt_type).toBe('quiz');

    // Check assessment details
    expect(result!.assessment_details.total_questions).toBe(8);
    expect(result!.assessment_details.correct_answers).toBe(7);
    expect(result!.assessment_details.score_percentage).toBe(95);
    expect(result!.assessment_details.questions_attempted).toHaveLength(1);
    expect(result!.assessment_details.questions_attempted[0].attempt_type).toBe('assessment');
  });

  it('should return specific achievement when achievement_id is provided', async () => {
    // Create student
    const students = await db.insert(studentsTable)
      .values({
        name: 'Jane Smith',
        email: 'jane@example.com',
        grade: '11th'
      })
      .returning()
      .execute();

    const student = students[0];

    // Create achievements
    const achievements = await db.insert(studentAchievementsTable)
      .values([
        {
          student_id: student.id,
          quiz_score: 60,
          assessment_score: 65,
          total_quiz_questions: 8,
          correct_quiz_answers: 5,
          total_assessment_questions: 6,
          correct_assessment_answers: 4,
          performance_level: 'satisfactory',
          time_spent_minutes: 30
        },
        {
          student_id: student.id,
          quiz_score: 85,
          assessment_score: 90,
          total_quiz_questions: 10,
          correct_quiz_answers: 8,
          total_assessment_questions: 5,
          correct_assessment_answers: 5,
          performance_level: 'good',
          time_spent_minutes: 50
        }
      ])
      .returning()
      .execute();

    const input: GetAchievementReportInput = {
      student_id: student.id,
      achievement_id: achievements[0].id // Request first achievement specifically
    };

    const result = await getAchievementReport(input);

    expect(result).not.toBeNull();
    expect(result!.achievement.id).toBe(achievements[0].id);
    expect(result!.achievement.quiz_score).toBe(60);
    expect(result!.achievement.assessment_score).toBe(65);
    expect(result!.achievement.performance_level).toBe('satisfactory');
  });

  it('should return null when specified achievement_id does not exist', async () => {
    // Create student
    const students = await db.insert(studentsTable)
      .values({
        name: 'Test Student',
        email: 'test@example.com',
        grade: '9th'
      })
      .returning()
      .execute();

    const input: GetAchievementReportInput = {
      student_id: students[0].id,
      achievement_id: 999 // Non-existent achievement
    };

    const result = await getAchievementReport(input);
    expect(result).toBeNull();
  });

  it('should return null when achievement_id belongs to different student', async () => {
    // Create two students
    const students = await db.insert(studentsTable)
      .values([
        {
          name: 'Student One',
          email: 'one@example.com',
          grade: '10th'
        },
        {
          name: 'Student Two',
          email: 'two@example.com',
          grade: '11th'
        }
      ])
      .returning()
      .execute();

    // Create achievement for second student
    const achievements = await db.insert(studentAchievementsTable)
      .values({
        student_id: students[1].id,
        quiz_score: 80,
        assessment_score: 85,
        total_quiz_questions: 10,
        correct_quiz_answers: 8,
        total_assessment_questions: 5,
        correct_assessment_answers: 4,
        performance_level: 'good',
        time_spent_minutes: 40
      })
      .returning()
      .execute();

    // Try to get achievement of second student using first student's ID
    const input: GetAchievementReportInput = {
      student_id: students[0].id,
      achievement_id: achievements[0].id
    };

    const result = await getAchievementReport(input);
    expect(result).toBeNull();
  });

  it('should handle students with no quiz or assessment attempts', async () => {
    // Create student
    const students = await db.insert(studentsTable)
      .values({
        name: 'New Student',
        email: 'new@example.com',
        grade: '12th'
      })
      .returning()
      .execute();

    const student = students[0];

    // Create achievement with no attempts
    await db.insert(studentAchievementsTable)
      .values({
        student_id: student.id,
        quiz_score: 0,
        assessment_score: 0,
        total_quiz_questions: 0,
        correct_quiz_answers: 0,
        total_assessment_questions: 0,
        correct_assessment_answers: 0,
        performance_level: 'needs_improvement',
        time_spent_minutes: null
      })
      .execute();

    const input: GetAchievementReportInput = {
      student_id: student.id
    };

    const result = await getAchievementReport(input);

    expect(result).not.toBeNull();
    expect(result!.quiz_details.total_questions).toBe(0);
    expect(result!.quiz_details.correct_answers).toBe(0);
    expect(result!.quiz_details.score_percentage).toBe(0);
    expect(result!.quiz_details.questions_attempted).toHaveLength(0);

    expect(result!.assessment_details.total_questions).toBe(0);
    expect(result!.assessment_details.correct_answers).toBe(0);
    expect(result!.assessment_details.score_percentage).toBe(0);
    expect(result!.assessment_details.questions_attempted).toHaveLength(0);

    expect(result!.achievement.time_spent_minutes).toBeNull();
  });

  it('should correctly separate quiz and assessment attempts', async () => {
    // Create student
    const students = await db.insert(studentsTable)
      .values({
        name: 'Mixed Student',
        email: 'mixed@example.com',
        grade: '10th'
      })
      .returning()
      .execute();

    const student = students[0];

    // Create quiz questions
    const questions = await db.insert(quizQuestionsTable)
      .values([
        {
          question_text: 'Quiz Question 1',
          option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D',
          correct_answer: 'A',
          question_type: 'quiz',
          difficulty_level: 'easy',
          topic: 'Topic1',
          explanation: null
        },
        {
          question_text: 'Quiz Question 2',
          option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D',
          correct_answer: 'B',
          question_type: 'quiz',
          difficulty_level: 'medium',
          topic: 'Topic1',
          explanation: null
        },
        {
          question_text: 'Assessment Question 1',
          option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D',
          correct_answer: 'C',
          question_type: 'assessment',
          difficulty_level: 'hard',
          topic: 'Topic2',
          explanation: 'Test explanation'
        }
      ])
      .returning()
      .execute();

    // Create achievement
    await db.insert(studentAchievementsTable)
      .values({
        student_id: student.id,
        quiz_score: 75,
        assessment_score: 80,
        total_quiz_questions: 4,
        correct_quiz_answers: 3,
        total_assessment_questions: 2,
        correct_assessment_answers: 1,
        performance_level: 'good',
        time_spent_minutes: 45
      })
      .execute();

    // Create mixed attempts
    await db.insert(quizAttemptsTable)
      .values([
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
          selected_answer: 'A',
          is_correct: false,
          attempt_type: 'quiz'
        },
        {
          student_id: student.id,
          question_id: questions[2].id,
          selected_answer: 'D',
          is_correct: false,
          attempt_type: 'assessment'
        }
      ])
      .execute();

    const input: GetAchievementReportInput = {
      student_id: student.id
    };

    const result = await getAchievementReport(input);

    expect(result).not.toBeNull();
    
    // Check quiz attempts are separated correctly
    expect(result!.quiz_details.questions_attempted).toHaveLength(2);
    result!.quiz_details.questions_attempted.forEach(attempt => {
      expect(attempt.attempt_type).toBe('quiz');
    });

    // Check assessment attempts are separated correctly
    expect(result!.assessment_details.questions_attempted).toHaveLength(1);
    expect(result!.assessment_details.questions_attempted[0].attempt_type).toBe('assessment');
    expect(result!.assessment_details.questions_attempted[0].is_correct).toBe(false);
  });
});