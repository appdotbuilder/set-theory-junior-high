import { db } from '../db';
import { materialSectionsTable } from '../db/schema';
import { type MaterialSection } from '../schema';

interface CreateMaterialSectionInput {
  title: string;
  content: string;
  topic: string;
  order: number;
}

export const createMaterialSection = async (input: CreateMaterialSectionInput): Promise<MaterialSection> => {
  try {
    // Insert material section record
    const result = await db.insert(materialSectionsTable)
      .values({
        title: input.title,
        content: input.content,
        topic: input.topic,
        order: input.order
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Material section creation failed:', error);
    throw error;
  }
};