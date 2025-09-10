import { db } from '../db';
import { quizQuestionsTable } from '../db/schema';
import { type CreateQuizQuestionInput, type QuizQuestion } from '../schema';

export const createQuizQuestion = async (input: CreateQuizQuestionInput): Promise<QuizQuestion> => {
  try {
    // Insert quiz question record
    const result = await db.insert(quizQuestionsTable)
      .values({
        question_text: input.question_text,
        option_a: input.option_a,
        option_b: input.option_b,
        option_c: input.option_c,
        option_d: input.option_d,
        correct_answer: input.correct_answer,
        question_type: input.question_type,
        difficulty_level: input.difficulty_level,
        topic: input.topic,
        explanation: input.explanation
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Quiz question creation failed:', error);
    throw error;
  }
};