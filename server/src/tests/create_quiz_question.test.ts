import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quizQuestionsTable } from '../db/schema';
import { type CreateQuizQuestionInput } from '../schema';
import { createQuizQuestion } from '../handlers/create_quiz_question';
import { eq } from 'drizzle-orm';

// Test input for quiz questions
const quizInput: CreateQuizQuestionInput = {
  question_text: 'What is the intersection of sets A = {1, 2, 3} and B = {2, 3, 4}?',
  option_a: '{1, 2, 3, 4}',
  option_b: '{2, 3}',
  option_c: '{1, 4}',
  option_d: '{}',
  correct_answer: 'B',
  question_type: 'quiz',
  difficulty_level: 'easy',
  topic: 'Intersection and Union of Sets',
  explanation: 'The intersection contains only elements present in both sets.'
};

const assessmentInput: CreateQuizQuestionInput = {
  question_text: 'Given sets A = {x | x is a prime number less than 10} and B = {x | x is an odd number less than 8}, find A ∪ B.',
  option_a: '{1, 2, 3, 5, 7}',
  option_b: '{2, 3, 5, 7}',
  option_c: '{1, 3, 5, 7}',
  option_d: '{3, 5, 7}',
  correct_answer: 'A',
  question_type: 'assessment',
  difficulty_level: 'hard',
  topic: 'Intersection and Union of Sets',
  explanation: 'A = {2, 3, 5, 7} and B = {1, 3, 5, 7}. The union A ∪ B = {1, 2, 3, 5, 7}.'
};

describe('createQuizQuestion', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a quiz question', async () => {
    const result = await createQuizQuestion(quizInput);

    // Verify all fields are correctly set
    expect(result.question_text).toEqual('What is the intersection of sets A = {1, 2, 3} and B = {2, 3, 4}?');
    expect(result.option_a).toEqual('{1, 2, 3, 4}');
    expect(result.option_b).toEqual('{2, 3}');
    expect(result.option_c).toEqual('{1, 4}');
    expect(result.option_d).toEqual('{}');
    expect(result.correct_answer).toEqual('B');
    expect(result.question_type).toEqual('quiz');
    expect(result.difficulty_level).toEqual('easy');
    expect(result.topic).toEqual('Intersection and Union of Sets');
    expect(result.explanation).toEqual('The intersection contains only elements present in both sets.');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create an assessment question', async () => {
    const result = await createQuizQuestion(assessmentInput);

    expect(result.question_text).toEqual('Given sets A = {x | x is a prime number less than 10} and B = {x | x is an odd number less than 8}, find A ∪ B.');
    expect(result.correct_answer).toEqual('A');
    expect(result.question_type).toEqual('assessment');
    expect(result.difficulty_level).toEqual('hard');
    expect(result.topic).toEqual('Intersection and Union of Sets');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save question to database', async () => {
    const result = await createQuizQuestion(quizInput);

    // Query the database to verify the question was saved
    const questions = await db.select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.id, result.id))
      .execute();

    expect(questions).toHaveLength(1);
    expect(questions[0].question_text).toEqual('What is the intersection of sets A = {1, 2, 3} and B = {2, 3, 4}?');
    expect(questions[0].option_b).toEqual('{2, 3}');
    expect(questions[0].correct_answer).toEqual('B');
    expect(questions[0].question_type).toEqual('quiz');
    expect(questions[0].difficulty_level).toEqual('easy');
    expect(questions[0].topic).toEqual('Intersection and Union of Sets');
    expect(questions[0].explanation).toEqual('The intersection contains only elements present in both sets.');
    expect(questions[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle null explanation', async () => {
    const inputWithoutExplanation: CreateQuizQuestionInput = {
      ...quizInput,
      explanation: null
    };

    const result = await createQuizQuestion(inputWithoutExplanation);

    expect(result.explanation).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const questions = await db.select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.id, result.id))
      .execute();

    expect(questions[0].explanation).toBeNull();
  });

  it('should create multiple questions with different topics', async () => {
    const mathInput: CreateQuizQuestionInput = {
      question_text: 'What is 2 + 2?',
      option_a: '3',
      option_b: '4',
      option_c: '5',
      option_d: '6',
      correct_answer: 'B',
      question_type: 'quiz',
      difficulty_level: 'easy',
      topic: 'Basic Arithmetic',
      explanation: 'Simple addition: 2 + 2 = 4'
    };

    const result1 = await createQuizQuestion(quizInput);
    const result2 = await createQuizQuestion(mathInput);

    expect(result1.topic).toEqual('Intersection and Union of Sets');
    expect(result2.topic).toEqual('Basic Arithmetic');
    expect(result1.id).not.toEqual(result2.id);

    // Verify both are in database
    const allQuestions = await db.select()
      .from(quizQuestionsTable)
      .execute();

    expect(allQuestions).toHaveLength(2);
  });

  it('should handle different difficulty levels and question types', async () => {
    const mediumQuizInput: CreateQuizQuestionInput = {
      question_text: 'If A = {1, 3, 5} and B = {2, 4, 6}, what is A ∩ B?',
      option_a: '{1, 2, 3, 4, 5, 6}',
      option_b: '{3}',
      option_c: '{}',
      option_d: '{1, 5}',
      correct_answer: 'C',
      question_type: 'assessment',
      difficulty_level: 'medium',
      topic: 'Intersection and Union of Sets',
      explanation: 'Sets A and B have no common elements, so their intersection is empty.'
    };

    const result = await createQuizQuestion(mediumQuizInput);

    expect(result.question_type).toEqual('assessment');
    expect(result.difficulty_level).toEqual('medium');
    expect(result.correct_answer).toEqual('C');
  });
});