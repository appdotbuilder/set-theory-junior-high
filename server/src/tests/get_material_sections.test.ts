import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { materialSectionsTable } from '../db/schema';
import { getMaterialSections } from '../handlers/get_material_sections';

describe('getMaterialSections', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no material sections exist', async () => {
    const result = await getMaterialSections();

    expect(result).toEqual([]);
  });

  it('should return material sections ordered by order field', async () => {
    // Create test material sections in reverse order
    const section3 = await db.insert(materialSectionsTable)
      .values({
        title: 'Union of Sets',
        content: 'The union of sets A and B is the set of all elements that are in A, or in B, or in both.',
        topic: 'Set Theory',
        order: 3
      })
      .returning()
      .execute();

    const section1 = await db.insert(materialSectionsTable)
      .values({
        title: 'Introduction to Sets',
        content: 'A set is a well-defined collection of distinct objects.',
        topic: 'Set Theory',
        order: 1
      })
      .returning()
      .execute();

    const section2 = await db.insert(materialSectionsTable)
      .values({
        title: 'Intersection of Sets',
        content: 'The intersection of sets A and B is the set of elements that are common to both A and B.',
        topic: 'Set Theory',
        order: 2
      })
      .returning()
      .execute();

    const result = await getMaterialSections();

    expect(result).toHaveLength(3);
    
    // Verify ordering by order field
    expect(result[0].title).toEqual('Introduction to Sets');
    expect(result[0].order).toEqual(1);
    expect(result[1].title).toEqual('Intersection of Sets');
    expect(result[1].order).toEqual(2);
    expect(result[2].title).toEqual('Union of Sets');
    expect(result[2].order).toEqual(3);

    // Verify all fields are correctly returned
    expect(result[0].id).toBeDefined();
    expect(result[0].content).toEqual('A set is a well-defined collection of distinct objects.');
    expect(result[0].topic).toEqual('Set Theory');
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return all material sections regardless of topic', async () => {
    // Create sections for different topics
    await db.insert(materialSectionsTable)
      .values({
        title: 'Basic Algebra',
        content: 'Introduction to algebraic expressions',
        topic: 'Algebra',
        order: 1
      })
      .returning()
      .execute();

    await db.insert(materialSectionsTable)
      .values({
        title: 'Set Operations',
        content: 'Operations on sets including union and intersection',
        topic: 'Set Theory',
        order: 2
      })
      .returning()
      .execute();

    await db.insert(materialSectionsTable)
      .values({
        title: 'Basic Geometry',
        content: 'Introduction to geometric shapes',
        topic: 'Geometry',
        order: 3
      })
      .returning()
      .execute();

    const result = await getMaterialSections();

    expect(result).toHaveLength(3);
    
    // Should be ordered by order field regardless of topic
    expect(result[0].topic).toEqual('Algebra');
    expect(result[0].order).toEqual(1);
    expect(result[1].topic).toEqual('Set Theory');
    expect(result[1].order).toEqual(2);
    expect(result[2].topic).toEqual('Geometry');
    expect(result[2].order).toEqual(3);
  });

  it('should handle sections with same order values', async () => {
    // Create sections with same order value
    await db.insert(materialSectionsTable)
      .values({
        title: 'First Section',
        content: 'First section content',
        topic: 'Mathematics',
        order: 1
      })
      .returning()
      .execute();

    await db.insert(materialSectionsTable)
      .values({
        title: 'Second Section',
        content: 'Second section content',
        topic: 'Mathematics',
        order: 1
      })
      .returning()
      .execute();

    const result = await getMaterialSections();

    expect(result).toHaveLength(2);
    // Both sections should be returned
    expect(result.some(section => section.title === 'First Section')).toBe(true);
    expect(result.some(section => section.title === 'Second Section')).toBe(true);
    expect(result[0].order).toEqual(1);
    expect(result[1].order).toEqual(1);
  });

  it('should return correct data types for all fields', async () => {
    await db.insert(materialSectionsTable)
      .values({
        title: 'Test Section',
        content: 'Test content with detailed explanation',
        topic: 'Test Topic',
        order: 42
      })
      .returning()
      .execute();

    const result = await getMaterialSections();

    expect(result).toHaveLength(1);
    const section = result[0];
    
    expect(typeof section.id).toBe('number');
    expect(typeof section.title).toBe('string');
    expect(typeof section.content).toBe('string');
    expect(typeof section.topic).toBe('string');
    expect(typeof section.order).toBe('number');
    expect(section.created_at).toBeInstanceOf(Date);
  });
});