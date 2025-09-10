import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quizQuestionsTable } from '../db/schema';
import { type CreateQuizQuestionInput } from '../schema';
import { getQuizQuestions } from '../handlers/get_quiz_questions';
import { eq } from 'drizzle-orm';

// Test quiz question data
const testQuizQuestion: CreateQuizQuestionInput = {
  question_text: 'What is the union of sets A = {1, 2} and B = {2, 3}?',
  option_a: '{1, 2, 3}',
  option_b: '{2}',
  option_c: '{1, 3}',
  option_d: '{1, 2, 2, 3}',
  correct_answer: 'A',
  question_type: 'quiz',
  difficulty_level: 'easy',
  topic: 'Set Theory',
  explanation: 'The union combines all unique elements from both sets.'
};

const testAssessmentQuestion: CreateQuizQuestionInput = {
  question_text: 'What is the intersection of sets A = {1, 2, 3} and B = {2, 3, 4}?',
  option_a: '{1, 2, 3, 4}',
  option_b: '{2, 3}',
  option_c: '{1, 4}',
  option_d: '{}',
  correct_answer: 'B',
  question_type: 'assessment',
  difficulty_level: 'medium',
  topic: 'Set Theory',
  explanation: 'The intersection contains only elements present in both sets.'
};

const testHardAssessmentQuestion: CreateQuizQuestionInput = {
  question_text: 'Given sets A = {x | x is even, x ≤ 10} and B = {x | x is prime, x ≤ 10}, what is |A ∩ B|?',
  option_a: '0',
  option_b: '1',
  option_c: '2',
  option_d: '3',
  correct_answer: 'B',
  question_type: 'assessment',
  difficulty_level: 'hard',
  topic: 'Set Theory',
  explanation: 'A = {2, 4, 6, 8, 10}, B = {2, 3, 5, 7}, A ∩ B = {2}, so |A ∩ B| = 1.'
};

describe('getQuizQuestions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return quiz questions only when questionType is quiz', async () => {
    // Create test questions of different types
    await db.insert(quizQuestionsTable).values([
      testQuizQuestion,
      testAssessmentQuestion,
      testHardAssessmentQuestion
    ]).execute();

    const result = await getQuizQuestions('quiz');

    expect(result).toHaveLength(1);
    expect(result[0].question_type).toEqual('quiz');
    expect(result[0].question_text).toEqual('What is the union of sets A = {1, 2} and B = {2, 3}?');
    expect(result[0].difficulty_level).toEqual('easy');
    expect(result[0].topic).toEqual('Set Theory');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return assessment questions only when questionType is assessment', async () => {
    // Create test questions of different types
    await db.insert(quizQuestionsTable).values([
      testQuizQuestion,
      testAssessmentQuestion,
      testHardAssessmentQuestion
    ]).execute();

    const result = await getQuizQuestions('assessment');

    expect(result).toHaveLength(2);
    result.forEach(question => {
      expect(question.question_type).toEqual('assessment');
      expect(question.topic).toEqual('Set Theory');
      expect(question.id).toBeDefined();
      expect(question.created_at).toBeInstanceOf(Date);
    });

    // Verify we have both medium and hard difficulty questions
    const difficulties = result.map(q => q.difficulty_level);
    expect(difficulties).toContain('medium');
    expect(difficulties).toContain('hard');
  });

  it('should return empty array when no questions match the type', async () => {
    // Create only quiz questions
    await db.insert(quizQuestionsTable).values([testQuizQuestion]).execute();

    const result = await getQuizQuestions('assessment');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array when no questions exist', async () => {
    const result = await getQuizQuestions('quiz');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should include all question fields correctly', async () => {
    await db.insert(quizQuestionsTable).values([testQuizQuestion]).execute();

    const result = await getQuizQuestions('quiz');

    expect(result).toHaveLength(1);
    const question = result[0];
    
    // Verify all fields are present and correct
    expect(question.question_text).toEqual(testQuizQuestion.question_text);
    expect(question.option_a).toEqual(testQuizQuestion.option_a);
    expect(question.option_b).toEqual(testQuizQuestion.option_b);
    expect(question.option_c).toEqual(testQuizQuestion.option_c);
    expect(question.option_d).toEqual(testQuizQuestion.option_d);
    expect(question.correct_answer).toEqual(testQuizQuestion.correct_answer);
    expect(question.question_type).toEqual(testQuizQuestion.question_type);
    expect(question.difficulty_level).toEqual(testQuizQuestion.difficulty_level);
    expect(question.topic).toEqual(testQuizQuestion.topic);
    expect(question.explanation).toEqual(testQuizQuestion.explanation);
  });

  it('should handle questions with null explanation', async () => {
    const questionWithoutExplanation: CreateQuizQuestionInput = {
      ...testQuizQuestion,
      explanation: null
    };

    await db.insert(quizQuestionsTable).values([questionWithoutExplanation]).execute();

    const result = await getQuizQuestions('quiz');

    expect(result).toHaveLength(1);
    expect(result[0].explanation).toBeNull();
  });

  it('should randomize question order', async () => {
    // Create multiple questions to test randomization
    const questions: CreateQuizQuestionInput[] = Array.from({ length: 5 }, (_, i) => ({
      question_text: `Question ${i + 1} about set theory`,
      option_a: `Option A${i + 1}`,
      option_b: `Option B${i + 1}`,
      option_c: `Option C${i + 1}`,
      option_d: `Option D${i + 1}`,
      correct_answer: 'A' as const,
      question_type: 'quiz' as const,
      difficulty_level: 'easy' as const,
      topic: 'Set Theory',
      explanation: `Explanation for question ${i + 1}`
    }));

    await db.insert(quizQuestionsTable).values(questions).execute();

    // Get results multiple times to check for randomization
    const result1 = await getQuizQuestions('quiz');
    const result2 = await getQuizQuestions('quiz');

    expect(result1).toHaveLength(5);
    expect(result2).toHaveLength(5);

    // Note: Due to randomization, we can't guarantee different orders
    // but we can verify all questions are returned
    const questionTexts1 = result1.map(q => q.question_text).sort();
    const questionTexts2 = result2.map(q => q.question_text).sort();
    const expectedTexts = questions.map(q => q.question_text).sort();

    expect(questionTexts1).toEqual(expectedTexts);
    expect(questionTexts2).toEqual(expectedTexts);
  });

  it('should save questions to database correctly', async () => {
    await db.insert(quizQuestionsTable).values([testQuizQuestion]).execute();

    // Verify data was saved correctly in database
    const dbQuestions = await db.select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.question_type, 'quiz'))
      .execute();

    expect(dbQuestions).toHaveLength(1);
    expect(dbQuestions[0].question_text).toEqual(testQuizQuestion.question_text);
    expect(dbQuestions[0].correct_answer).toEqual(testQuizQuestion.correct_answer);
    expect(dbQuestions[0].created_at).toBeInstanceOf(Date);
  });
});