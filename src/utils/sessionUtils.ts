import { v4 as uuidv4 } from 'uuid';

/**
 * Gets or creates a session ID for anonymous users
 * Uses UUID v4 for unique identification and stores in localStorage
 */
export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4(); // Creates a new UUID
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

/**
 * Clears the current session ID
 * Useful for testing or when user wants to start fresh
 */
export const clearSessionId = (): void => {
  localStorage.removeItem('sessionId');
};

/**
 * Validates if a session ID is a proper UUID format
 */
export const isValidSessionId = (sessionId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
};