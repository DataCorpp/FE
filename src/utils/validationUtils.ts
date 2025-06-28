/**
 * Validation utilities for Datacom application
 * Provides helper functions for common validation tasks across the app
 */

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns True if the string is a valid MongoDB ObjectId (24 character hex string)
 */
export function isValidObjectId(id: string | undefined | null): boolean {
  if (!id) return false;
  
  // MongoDB ObjectIds are 24 character hex strings
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

/**
 * Validates a user ID to ensure it's a valid MongoDB ObjectId
 * @param userId - The user ID to validate
 * @throws Error if the user ID is invalid
 */
export function validateUserId(userId: string | undefined | null): void {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID format. Must be a valid MongoDB ObjectId.');
  }
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array)
 * @param value - The value to check
 * @returns True if the value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length === 0;
  return false;
}

/**
 * Validates an email address format
 * @param email - The email to validate
 * @returns True if the email is in a valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a URL format
 * @param url - The URL to validate
 * @returns True if the URL is in a valid format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
} 