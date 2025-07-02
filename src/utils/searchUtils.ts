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
  // Enable fuzzy matching for minor typos/misspellings
  fuzzy?: boolean;
  // Whether to check for terms across different fields
  crossFieldMatching?: boolean;
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
  const { 
    fields, 
    threshold = 0.2, 
    exact = false, 
    fuzzy = true,
    crossFieldMatching = true 
  } = options;

  // Calculate total weight (for normalization)
  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);

  // Score and filter items
  const scoredItems = items
    .map(item => {
      let score = 0;
      
      if (crossFieldMatching) {
        // Create a combined text for cross-field search
        const combinedText = fields
          .map(field => {
            const value = item[field.name];
            if (!value) return '';
            if (Array.isArray(value)) return value.join(' ').toLowerCase();
            return String(value).toLowerCase();
          })
          .join(' ');
        
        // Check if all search terms exist in the combined text (in any order)
        const allTermsExist = searchTerms.every(term => {
          // Check for exact match first
          if (combinedText.includes(term)) return true;
          
          // Try fuzzy matching if enabled
          if (fuzzy && term.length > 3) {
            return fuzzyMatch(combinedText, term);
          }
          
          return false;
        });
        
        if (allTermsExist) {
          // Boost score if all terms match across fields
          score += 0.5;
        }
      }
      
      // Calculate score for each search term
      for (const term of searchTerms) {
        let termScore = 0;
        
        // Check each field for matches
        for (const field of fields) {
          const fieldValue = item[field.name];
          if (!fieldValue) continue;
          
          const fieldValueStr = processFieldValue(fieldValue).toLowerCase();
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
              
              // Boost score for exact matches at word boundaries
              if (new RegExp(`\\b${escapeRegExp(term)}\\b`).test(fieldValueStr)) {
                termScore += fieldWeight * 0.3;
              }
            } else {
              // Check for partial matches (at least 3 chars)
              if (term.length >= 3 && fieldValueStr.includes(term.substring(0, Math.ceil(term.length * 0.7)))) {
                termScore += fieldWeight * 0.6;
              }
              
              // Try fuzzy matching if enabled
              if (fuzzy && term.length > 3 && fuzzyMatch(fieldValueStr, term)) {
                termScore += fieldWeight * 0.4;
              }
            }
          }
        }
        
        // Add the term score to the total
        score += termScore / searchTerms.length;
      }
      
      // Boost score for items that match more search terms
      const matchedTermsCount = searchTerms.filter(term => {
        return fields.some(field => {
          const fieldValue = item[field.name];
          if (!fieldValue) return false;
          
          const fieldValueStr = processFieldValue(fieldValue).toLowerCase();
          return fieldValueStr.includes(term);
        });
      }).length;
      
      const matchRatio = matchedTermsCount / searchTerms.length;
      score *= (1 + matchRatio * 0.5); // Boost by up to 50% for full matches
      
      return { item, score };
    })
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);
  
  return scoredItems.map(({ item }) => item);
}

/**
 * Converts field value to searchable string
 */
function processFieldValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(' ');
  }
  return String(value);
}

/**
 * Escape special characters for regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Simple fuzzy matching for handling typos
 * Uses Levenshtein distance for approximate matching
 */
function fuzzyMatch(text: string, term: string, maxDistance = 1): boolean {
  // If the term is very short, only allow exact matches
  if (term.length <= 3) return text.includes(term);
  
  // Split into words for checking term against each word
  const words = text.split(/\s+/);
  
  // Check if any word has a small edit distance from the term
  for (const word of words) {
    if (word.length < term.length - 1 || word.length > term.length + 2) {
      continue; // Skip words with big length difference
    }
    
    // Simple optimization: check if first and last characters match
    if (word[0] === term[0] || word[word.length - 1] === term[term.length - 1]) {
      if (levenshteinDistance(word, term) <= maxDistance) {
        return true;
      }
    }
  }
  
  // Also check for the term being embedded in longer words
  for (const word of words) {
    if (word.length >= term.length + 2) {
      for (let i = 0; i <= word.length - term.length; i++) {
        const substring = word.substring(i, i + term.length);
        if (levenshteinDistance(substring, term) <= maxDistance) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Simple function to determine if an item matches all search terms
 * across specified fields
 */
export function matchesAllTerms<T extends SearchableItem>(
  item: T,
  searchTerms: string[],
  fields: Array<keyof T>,
  crossFieldMatching = true
): boolean {
  if (!searchTerms.length) return true;
  
  // Cross-field matching - check if all terms appear somewhere in any field
  if (crossFieldMatching) {
    const combinedText = fields
      .map(field => {
        const value = item[field];
        if (!value) return '';
        if (Array.isArray(value)) return value.join(' ').toLowerCase();
        return String(value).toLowerCase();
      })
      .join(' ');
    
    return searchTerms.every(term => combinedText.includes(term));
  }
  
  // Traditional matching - all terms must appear in at least one field
  return searchTerms.every(term => {
    return fields.some(field => {
      const value = item[field];
      if (!value) return false;
      
      if (Array.isArray(value)) {
        return value.some(val => 
          String(val).toLowerCase().includes(term.toLowerCase())
        );
      }
      
      return String(value).toLowerCase().includes(term.toLowerCase());
    });
  });
}

/**
 * Quick search function that checks if any of the terms match any of the fields
 */
export function quickSearch<T extends SearchableItem>(
  items: T[],
  query: string,
  fields: Array<keyof T>,
  crossFieldMatching = true
): T[] {
  if (!query || !query.trim()) {
    return items;
  }
  
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return items.filter(item => {
    return matchesAllTerms(item, searchTerms, fields, crossFieldMatching);
  });
}

/**
 * Advanced cross-field search
 * This handles cases where search terms might be scattered across different fields
 * For example: "Miso Nagano" where "Miso" is in product name and "Nagano" is in manufacturer
 */
export function crossFieldSearch<T extends SearchableItem>(
  items: T[],
  query: string,
  fields: Array<keyof T>
): T[] {
  if (!query || !query.trim()) {
    return items;
  }
  
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return items.filter(item => {
    // Create a combined text from all relevant fields
    const combinedText = fields
      .map(field => {
        const value = item[field];
        if (!value) return '';
        if (Array.isArray(value)) return value.join(' ').toLowerCase();
        return String(value).toLowerCase();
      })
      .join(' ');
    
    // Check if all search terms exist in the combined text (in any order)
    return searchTerms.every(term => combinedText.includes(term));
  });
}
 