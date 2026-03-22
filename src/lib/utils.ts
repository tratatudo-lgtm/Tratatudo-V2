import.meta.env.VITE_API_URL import { type ClassValue, clsx } from 'clsx';
import.meta.env.VITE_API_URL import { twMerge } from 'tailwind-merge';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function cn(...inputs: ClassValue[]) {
import.meta.env.VITE_API_URL   return twMerge(clsx(inputs));
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL /**
import.meta.env.VITE_API_URL  * Safely extracts an array from an API response that might be wrapped in data, result, or ok.
import.meta.env.VITE_API_URL  */
import.meta.env.VITE_API_URL export function extractArrayResponse<T>(data: any, key?: string): T[] {
import.meta.env.VITE_API_URL   if (!data) return [];
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // If it's already an array, return it
import.meta.env.VITE_API_URL   if (Array.isArray(data)) return data;
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // Check common wrappers
import.meta.env.VITE_API_URL   const possibleArray = data.data || data.result || data.items || (key ? data[key] : null);
import.meta.env.VITE_API_URL   if (Array.isArray(possibleArray)) return possibleArray;
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // If 'ok' is true, look for other array properties
import.meta.env.VITE_API_URL   if (data.ok === true) {
import.meta.env.VITE_API_URL     for (const k in data) {
import.meta.env.VITE_API_URL       if (Array.isArray(data[k])) return data[k];
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   return [];
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL /**
import.meta.env.VITE_API_URL  * Safely extracts an object from an API response that might be wrapped in data, result, or ok.
import.meta.env.VITE_API_URL  */
import.meta.env.VITE_API_URL export function extractObjectResponse<T>(data: any, key?: string): T | null {
import.meta.env.VITE_API_URL   if (!data) return null;
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // If it has the key directly, return it
import.meta.env.VITE_API_URL   if (key && data[key]) return data[key];
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // Check common wrappers
import.meta.env.VITE_API_URL   if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data;
import.meta.env.VITE_API_URL   if (data.result && typeof data.result === 'object' && !Array.isArray(data.result)) return data.result;
import.meta.env.VITE_API_URL   if (data.settings && typeof data.settings === 'object') return data.settings;
import.meta.env.VITE_API_URL   if (data.instance && typeof data.instance === 'object') return data.instance;
import.meta.env.VITE_API_URL   if (data.subscription && typeof data.subscription === 'object') return data.subscription;
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // If 'ok' is true, look for other object properties
import.meta.env.VITE_API_URL   if (data.ok === true) {
import.meta.env.VITE_API_URL     for (const k in data) {
import.meta.env.VITE_API_URL       if (data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]) && k !== 'stats') {
import.meta.env.VITE_API_URL         return data[k];
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // If the data itself is an object and not an array, return it
import.meta.env.VITE_API_URL   if (typeof data === 'object' && !Array.isArray(data) && !data.ok) return data;
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   return null;
import.meta.env.VITE_API_URL }
