// Utility functions for generating deterministic colors from strings

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

/**
 * Generates a deterministic color from a string using a simple hash function
 * This matches the server-side implementation for consistency
 */
export const generateColorFromString = (str: string): string => {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a consistent index
  const colorIndex = Math.abs(hash) % COLORS.length;
  return COLORS[colorIndex];
};

/**
 * Gets the default color for players without an Ark address
 */
export const getDefaultPlayerColor = (): string => {
  return '#CCCCCC'; // Gray color for players without Ark address
};
