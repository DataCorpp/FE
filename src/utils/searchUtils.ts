/**
 * Advanced search utility functions for handling flexible search queries
 */

type SearchableItem = Record<string, any>;

interface SearchOptions<T extends SearchableItem> {
  // Fields to search in, with optional weight
  fields: Array<{
    name: keyof T;
    weight: number;
  }>;
  // Minimum match score (0-1) to include result
  threshold?: number;
  // Whether to use exact matching
  exact?: boolean;
}

/**
 * Performs an advanced search on a collection of items
 * 
 * @param items Array of items to search through
 * @param query Search query string
 * @param options Search configuration options
 * @returns Filtered and scored items sorted by relevance
 */
export function advancedSearch<T extends SearchableItem>(
  items: T[],
  query: string,
  options: SearchOptions<T>
): T[] {
  if (!query || !query.trim()) {
    return items;
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  const { fields, threshold = 0.2, exact = false } = options;

  // Calculate total weight (for normalization)
  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);

  // Score and filter items
  const scoredItems = items
    .map(item => {
      let score = 0;
      
      // Calculate score for each search term
      for (const term of searchTerms) {
        let termScore = 0;
        
        // Check each field for matches
        for (const field of fields) {
          const fieldValue = item[field.name];
          if (!fieldValue) continue;
          
          const fieldValueStr = String(fieldValue).toLowerCase();
          const fieldWeight = field.weight / totalWeight; // Normalize weight
          
          if (exact) {
            // Exact matching
            if (fieldValueStr.includes(term)) {
              termScore += fieldWeight;
            }
          } else {
            // Partial matching (more flexible)
            if (fieldValueStr.includes(term)) {
              // Full term match has higher score
              termScore += fieldWeight;
            } else {
              // Check for partial matches (at least 3 chars)
              if (term.length >= 3 && fieldValueStr.includes(term.substring(0, Math.ceil(term.length * 0.7)))) {
                termScore += fieldWeight * 0.7;
              }
            }
          }
        }
        
        // Add the term score to the total
        score += termScore / searchTerms.length;
      }
      
      return { item, score };
    })
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);
  
  return scoredItems.map(({ item }) => item);
}

/**
 * Simple function to determine if an item matches all search terms
 * across specified fields
 */
export function matchesAllTerms<T extends SearchableItem>(
  item: T,
  searchTerms: string[],
  fields: Array<keyof T>
): boolean {
  if (!searchTerms.length) return true;
  
  return searchTerms.every(term => {
    return fields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(term.toLowerCase());
    });
  });
}

/**
 * Quick search function that checks if any of the terms match any of the fields
 */
export function quickSearch<T extends SearchableItem>(
  items: T[],
  query: string,
  fields: Array<keyof T>
): T[] {
  if (!query || !query.trim()) {
    return items;
  }
  
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return items.filter(item => {
    return matchesAllTerms(item, searchTerms, fields);
  });
}
 