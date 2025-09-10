import { db } from '../db';
import { quizQuestionsTable, quizAttemptsTable, studentsTable } from '../db/schema';
import { type SubmitQuizAnswerInput, type QuizAttempt } from '../schema';
import { eq } from 'drizzle-orm';

export async function submitQuizAnswer(input: SubmitQuizAnswerInput): Promise<QuizAttempt> {
  try {
    // 1. Verify the student exists
    const students = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, input.student_id))
      .execute();

    if (students.length === 0) {
      throw new Error(`Student with ID ${input.student_id} not found`);
    }

    // 2. Fetch the quiz question to get the correct answer
    const questions = await db.select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.id, input.question_id))
      .execute();

    if (questions.length === 0) {
      throw new Error(`Quiz question with ID ${input.question_id} not found`);
    }

    const question = questions[0];

    // 3. Compare the selected answer with the correct answer
    const is_correct = input.selected_answer === question.correct_answer;

    // 4. Store the attempt in the database
    const result = await db.insert(quizAttemptsTable)
      .values({
        student_id: input.student_id,
        question_id: input.question_id,
        selected_answer: input.selected_answer,
        is_correct: is_correct,
        attempt_type: input.attempt_type
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Submit quiz answer failed:', error);
    throw error;
  }
}