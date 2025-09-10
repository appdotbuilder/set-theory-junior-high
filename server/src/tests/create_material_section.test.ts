import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { materialSectionsTable } from '../db/schema';
import { createMaterialSection } from '../handlers/create_material_section';
import { eq } from 'drizzle-orm';

// Test input for creating material sections
const testInput = {
  title: 'Introduction to Sets',
  content: 'A set is a collection of distinct objects, called elements or members of the set.',
  topic: 'Set Theory',
  order: 1
};

describe('createMaterialSection', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a material section', async () => {
    const result = await createMaterialSection(testInput);

    // Basic field validation
    expect(result.title).toEqual('Introduction to Sets');
    expect(result.content).toEqual(testInput.content);
    expect(result.topic).toEqual('Set Theory');
    expect(result.order).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save material section to database', async () => {
    const result = await createMaterialSection(testInput);

    // Query using proper drizzle syntax
    const materialSections = await db.select()
      .from(materialSectionsTable)
      .where(eq(materialSectionsTable.id, result.id))
      .execute();

    expect(materialSections).toHaveLength(1);
    expect(materialSections[0].title).toEqual('Introduction to Sets');
    expect(materialSections[0].content).toEqual(testInput.content);
    expect(materialSections[0].topic).toEqual('Set Theory');
    expect(materialSections[0].order).toEqual(1);
    expect(materialSections[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different topics', async () => {
    const algebraInput = {
      title: 'Linear Equations',
      content: 'A linear equation is an equation that makes a straight line when graphed.',
      topic: 'Algebra',
      order: 1
    };

    const result = await createMaterialSection(algebraInput);

    expect(result.title).toEqual('Linear Equations');
    expect(result.topic).toEqual('Algebra');
    expect(result.content).toEqual(algebraInput.content);
    expect(result.order).toEqual(1);
  });

  it('should handle different order values', async () => {
    // Create multiple sections with different orders
    const section1 = await createMaterialSection({
      ...testInput,
      title: 'Section 1',
      order: 1
    });

    const section2 = await createMaterialSection({
      ...testInput,
      title: 'Section 2',
      order: 10
    });

    expect(section1.order).toEqual(1);
    expect(section2.order).toEqual(10);
  });

  it('should create multiple sections for same topic', async () => {
    const section1 = await createMaterialSection({
      ...testInput,
      title: 'Sets Basics',
      order: 1
    });

    const section2 = await createMaterialSection({
      ...testInput,
      title: 'Set Operations',
      order: 2
    });

    // Both should belong to the same topic
    expect(section1.topic).toEqual('Set Theory');
    expect(section2.topic).toEqual('Set Theory');
    
    // But have different titles and orders
    expect(section1.title).toEqual('Sets Basics');
    expect(section2.title).toEqual('Set Operations');
    expect(section1.order).toEqual(1);
    expect(section2.order).toEqual(2);
  });
});