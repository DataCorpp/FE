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
 * Calculates the Levenshtein distance between two strings
 * This measures how many character edits (insertions, deletions, substitutions)
 * are needed to transform one string into another
 * 
 * @param a First string
 * @param b Second string
 * @returns Number representing the edit distance
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Computes similarity score between two strings (0-1)
 * where 1 is perfect match and 0 is completely different
 * 
 * @param a First string
 * @param b Second string
 * @returns Similarity score between 0 and 1
 */
export function stringSimilarity(a: string, b: string): number {
  if (!a && !b) return 1; // Both empty = perfect match
  if (!a || !b) return 0; // One empty = no match
  
  // Use shorter string as reference for max distance
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  return 1 - distance / maxLength;
}

/**
 * Fuzzy search that handles typos and partial matches using Levenshtein distance
 * 
 * @param items Array of items to search
 * @param query Search query 
 * @param fields Fields to search in
 * @param options Search configuration
 * @returns Filtered and scored items sorted by relevance
 */
export function fuzzySearch<T extends SearchableItem>(
  items: T[],
  query: string,
  fields: ReadonlyArray<keyof T>,
  options: {
    threshold?: number;
    tokenize?: boolean;
  } = {}
): T[] {
  if (!query || !query.trim()) {
    return items;
  }

  const { threshold = 0.3, tokenize = true } = options;
  const searchTerms = tokenize 
    ? query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1)
    : [query.toLowerCase().trim()];
  
  if (searchTerms.length === 0) return items;
  
  const scoredItems = items.map(item => {
    // Calculate best score across all searchable fields
    let itemScore = 0;
    let matchCount = 0;
    
    // For each search term
    searchTerms.forEach(term => {
      let bestTermScore = 0;
      
      // Check each field for the best match
      fields.forEach(field => {
        const fieldValue = item[field];
        if (!fieldValue) return;
        
        // Handle array fields (like ingredients, tags, etc.)
        if (Array.isArray(fieldValue)) {
          // Find best match in array
          fieldValue.forEach(value => {
            const valueStr = String(value).toLowerCase();
            
            // Check for exact containment first (highest priority)
            if (valueStr.includes(term)) {
              const score = term.length / valueStr.length * 0.8 + 0.2; // Longer matches relative to field get higher score
              bestTermScore = Math.max(bestTermScore, score);
            }
            // If no exact containment, try similarity
            else {
              const score = stringSimilarity(term, valueStr) * 0.7; // Similarity matches get lower weight
              bestTermScore = Math.max(bestTermScore, score);
            }
          });
        }
        // Handle string fields
        else {
          const fieldValueStr = String(fieldValue).toLowerCase();
          
          // Exact match gets highest score
          if (fieldValueStr === term) {
            bestTermScore = Math.max(bestTermScore, 1);
          }
          // Containment (field contains term) gets high score
          else if (fieldValueStr.includes(term)) {
            // Score based on how much of the field the term represents
            const score = term.length / fieldValueStr.length * 0.7 + 0.3;
            bestTermScore = Math.max(bestTermScore, score);
          }
          // Word boundary match (e.g. term is start of a word)
          else if (new RegExp(`\\b${term}`, 'i').test(fieldValueStr)) {
            bestTermScore = Math.max(bestTermScore, 0.8);
          }
          // If term is 3+ chars, try character-level similarity
          else if (term.length >= 3) {
            const similarity = stringSimilarity(term, fieldValueStr);
            bestTermScore = Math.max(bestTermScore, similarity * 0.6); // Lower weight for pure similarity
          }
        }
      });
      
      // Only count terms that had a decent match
      if (bestTermScore > threshold) {
        itemScore += bestTermScore;
        matchCount++;
      }
    });
    
    // Calculate final score
    // If we're searching for multiple terms, we want items matching more terms to rank higher
    let finalScore = 0;
    if (matchCount > 0) {
      // Average score of matched terms, weighted by how many terms matched
      // This ensures that matching more terms is better than matching fewer terms with higher scores
      finalScore = (itemScore / matchCount) * (matchCount / searchTerms.length);
    }
    
    return { item, score: finalScore };
  }).filter(({ score }) => score > threshold);
  
  // Sort by score (higher scores first)
  scoredItems.sort((a, b) => b.score - a.score);
  
  return scoredItems.map(({ item }) => item);
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
  fields: ReadonlyArray<keyof T>
): boolean {
  if (!searchTerms.length) return true;
  
  // Build a map of lowercase field values once for performance
  const fieldValues = fields.map(field => String(item[field] ?? "").toLowerCase());

  return searchTerms.every(term => {
    // Allow partial term match (>=3 chars) in addition to full term match
    return fieldValues.some(value => {
      if (value.includes(term)) return true; // full term match

      // partial (fuzzy) match – first 70% of the term must appear
      if (term.length >= 3) {
        const partial = term.substring(0, Math.ceil(term.length * 0.7));
        return value.includes(partial);
      }
      return false;
    });
  });
}

/**
 * Quick search function that checks if ALL search terms appear in ANY of the provided fields.
 * Accepts both mutable and readonly arrays for the `fields` parameter.
 */
export function quickSearch<T extends SearchableItem>(
  items: T[],
  query: string,
  fields: ReadonlyArray<keyof T>
): T[] {
  if (!query || !query.trim()) {
    return items;
  }
  
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return items.filter(item => matchesAllTerms(item, searchTerms, fields));
}

/**
 * Normalizes text by removing accents, replacing special characters and standardizing whitespace
 * This helps improve matching between texts with different representations of similar characters
 * 
 * @param text Text to normalize
 * @returns Normalized text suitable for comparison
 */
function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ')  // Standardize whitespace
    .trim();
}

/**
 * Generate potential variations of a word to improve fuzzy matching
 * This includes common typo patterns and phonetic similarities
 * 
 * @param word The word to generate variations for
 * @returns Array of word variations
 */
function generateWordVariations(word: string): string[] {
  if (!word || word.length <= 2) return [word];
  const variations: string[] = [word];
  
  // Handle common character swaps and simple typos
  if (word.length > 2) {
    // Character swaps (e.g. "sauce" -> "suace")
    for (let i = 0; i < word.length - 1; i++) {
      const swapped = word.substring(0, i) + 
                      word.charAt(i + 1) + 
                      word.charAt(i) + 
                      word.substring(i + 2);
      variations.push(swapped);
    }
    
    // Missing character (e.g. "sauce" -> "saue")
    for (let i = 0; i < word.length; i++) {
      const missing = word.substring(0, i) + word.substring(i + 1);
      if (missing.length >= 3) variations.push(missing);
    }
    
    // Extra common character (e.g. "sauce" -> "sauuce")
    for (let i = 0; i < word.length; i++) {
      const extra = word.substring(0, i + 1) + word.charAt(i) + word.substring(i + 1);
      variations.push(extra);
    }
  }
  
  // Handle common phonetic replacements
  const phonetics: Record<string, string[]> = {
    'ph': ['f'],
    'f': ['ph'],
    'sh': ['ch', 's'],
    'ch': ['sh', 'k'],
    'c': ['k', 's'],
    'k': ['c'],
    's': ['c', 'z'],
    'z': ['s'],
    'j': ['g', 'y'],
    'g': ['j'],
    'y': ['i'],
    'i': ['y'],
    'kk': ['cc', 'ck'],
    'cc': ['kk'],
    'ck': ['kk', 'cc'],
  };
  
  // Apply phonetic replacements
  for (const [pattern, replacements] of Object.entries(phonetics)) {
    if (word.includes(pattern)) {
      for (const replacement of replacements) {
        const phoneticVar = word.replace(pattern, replacement);
        variations.push(phoneticVar);
      }
    }
  }
  
  return [...new Set(variations)]; // Remove duplicates
}

/**
 * Enhanced fuzzy search that handles messy user input including:
 * - Text normalization (accents, special chars)
 * - Word order invariance
 * - Cross-field matching
 * - Word variations for common typos
 * - Better handling of multi-term queries
 * 
 * @param items Array of items to search
 * @param query Search query 
 * @param fields Fields to search in
 * @param options Search configuration
 * @returns Filtered and scored items sorted by relevance
 */
export function enhancedFuzzySearch<T extends SearchableItem>(
  items: T[],
  query: string,
  fields: ReadonlyArray<keyof T>,
  options: {
    threshold?: number;
    boostExact?: boolean;
    maxResults?: number;
  } = {}
): T[] {
  if (!query || !query.trim()) {
    return items;
  }

  const { 
    threshold = 0.15, 
    boostExact = true,
    maxResults = 200
  } = options;

  // Normalize the query and prepare tokens
  const normalizedQuery = normalizeText(query);
  const originalTokens = normalizedQuery.split(/\s+/).filter(t => t.length >= 2);
  
  if (originalTokens.length === 0) return items;
  
  // Generate token variations to improve matching
  const tokenMap = new Map<string, string[]>();
  const allTokens: string[] = [];
  
  // For each original token, create variations and track the parent
  originalTokens.forEach(token => {
    const variations = generateWordVariations(token);
    tokenMap.set(token, variations);
    allTokens.push(...variations);
  });
  
  // Function to calculate a field's searchable text once (for performance)
  const getSearchableText = (item: T, field: keyof T): string => {
    const value = item[field];
    if (!value) return '';
    
    if (Array.isArray(value)) {
      return normalizeText(value.join(' '));
    }
    return normalizeText(String(value));
  };
  
  // Calculate combined field text for each item once
  const itemSearchableText = items.map(item => {
    const fieldTexts: Record<string, string> = {};
    const combinedText: string[] = [];
    
    fields.forEach(field => {
      const text = getSearchableText(item, field);
      fieldTexts[field as string] = text;
      combinedText.push(text);
    });
    
    return {
      item,
      fieldTexts,
      combinedText: combinedText.join(' ')
    };
  });
  
  // Score each item
  const scoredItems = itemSearchableText.map(({ item, fieldTexts, combinedText }) => {
    // First check if the full query appears exactly anywhere
    const hasExactMatch = boostExact && combinedText.includes(normalizedQuery);
    
    // Track matched tokens per field and overall
    const tokenMatches = new Map<string, number>();
    let totalTokenMatches = 0;
    let longestSequenceMatch = 0;
    let currentSequence = 0;
    
    // Check for matches of each token (including variations)
    originalTokens.forEach(originalToken => {
      let bestScore = 0;
      
      // Check if any variation of this token matches
      const variations = tokenMap.get(originalToken) || [originalToken];
      
      for (const variation of variations) {
        // Get proximity bonus if a token is near another
        if (combinedText.includes(variation)) {
          // Direct match - full token value
          bestScore = Math.max(bestScore, 1);
          
          // If this token continues the sequence of matched tokens
          if (originalTokens.indexOf(originalToken) === currentSequence) {
            currentSequence++;
            longestSequenceMatch = Math.max(longestSequenceMatch, currentSequence);
          } else {
            currentSequence = 0;
          }
          
          totalTokenMatches++;
          break; // No need to check other variations of this token
        } else {
          // Check for partial match (beginning of a longer word)
          const regex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*`, 'i');
          if (regex.test(combinedText)) {
            bestScore = Math.max(bestScore, 0.9);
            totalTokenMatches++;
            break;
          }
          
          // Check for substring match
          if (combinedText.includes(variation)) {
            bestScore = Math.max(bestScore, 0.8);
            totalTokenMatches++;
            break;
          }
          
          // Use Levenshtein for more distant matches
          if (variation.length >= 3) {
            // Find closest word in text
            const words = combinedText.split(/\s+/);
            for (const word of words) {
              if (Math.abs(word.length - variation.length) <= 2) {
                const similarity = stringSimilarity(variation, word);
                if (similarity > 0.8) {
                  bestScore = Math.max(bestScore, 0.7 * similarity);
                }
              }
            }
          }
        }
      }
      
      // Store best match score for this token
      if (bestScore > 0) {
        tokenMatches.set(originalToken, bestScore);
      }
    });
    
    // Calculate final score
    let score = 0;
    
    // Boost for sequence matches (tokens in the correct order)
    const sequenceBoost = longestSequenceMatch > 1 ? 
      (longestSequenceMatch / originalTokens.length) * 0.3 : 0;
    
    // 1. If all tokens matched, give a high score
    if (tokenMatches.size === originalTokens.length) {
      // Perfect match - all tokens found
      score = originalTokens
        .map(t => tokenMatches.get(t) || 0)
        .reduce((sum, val) => sum + val, 0) / originalTokens.length;
      
      // Boost for perfect sequence matches
      score += sequenceBoost;
    } 
    // 2. If partial match, use proportion of matched tokens
    else if (tokenMatches.size > 0) {
      // Get average score of matched tokens
      const matchedTokensScore = Array.from(tokenMatches.values())
        .reduce((sum, val) => sum + val, 0) / tokenMatches.size;
      
      // Weight by proportion of tokens matched
      score = matchedTokensScore * (tokenMatches.size / originalTokens.length);
      
      // Boost for sequence matches
      score += sequenceBoost;
    }
    
    // 3. Exact match bonus
    if (hasExactMatch) {
      score = Math.min(1, score + 0.3); // Cap at 1.0
    }
    
    return { item, score };
  });

  // Filter and sort
  return scoredItems
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ item }) => item);
}
 