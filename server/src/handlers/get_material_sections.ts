import { db } from '../db';
import { materialSectionsTable } from '../db/schema';
import { type MaterialSection } from '../schema';
import { asc } from 'drizzle-orm';

export async function getMaterialSections(): Promise<MaterialSection[]> {
  try {
    // Fetch all material sections ordered by the 'order' field
    const results = await db.select()
      .from(materialSectionsTable)
      .orderBy(asc(materialSectionsTable.order))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch material sections:', error);
    throw error;
  }
}