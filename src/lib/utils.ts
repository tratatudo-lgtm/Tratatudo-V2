import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts an array from an API response that might be wrapped in data, result, or ok.
 */
export function extractArrayResponse<T>(data: any, key?: string): T[] {
  if (!data) return [];
  
  // If it's already an array, return it
  if (Array.isArray(data)) return data;
  
  // Check common wrappers
  const possibleArray = data.data || data.result || data.items || (key ? data[key] : null);
  if (Array.isArray(possibleArray)) return possibleArray;
  
  // If 'ok' is true, look for other array properties
  if (data.ok === true) {
    for (const k in data) {
      if (Array.isArray(data[k])) return data[k];
    }
  }
  
  return [];
}

/**
 * Safely extracts an object from an API response that might be wrapped in data, result, or ok.
 */
export function extractObjectResponse<T>(data: any, key?: string): T | null {
  if (!data) return null;
  
  // If it has the key directly, return it
  if (key && data[key]) return data[key];
  
  // Check common wrappers
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data;
  if (data.result && typeof data.result === 'object' && !Array.isArray(data.result)) return data.result;
  if (data.settings && typeof data.settings === 'object') return data.settings;
  if (data.instance && typeof data.instance === 'object') return data.instance;
  if (data.subscription && typeof data.subscription === 'object') return data.subscription;
  
  // If 'ok' is true, look for other object properties
  if (data.ok === true) {
    for (const k in data) {
      if (data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]) && k !== 'stats') {
        return data[k];
      }
    }
  }
  
  // If the data itself is an object and not an array, return it
  if (typeof data === 'object' && !Array.isArray(data) && !data.ok) return data;
  
  return null;
}
