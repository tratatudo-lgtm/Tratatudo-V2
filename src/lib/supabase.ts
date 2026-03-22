import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing");
  }
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  console.log("Supabase client initialized successfully.");
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Re-throw to be caught by main.tsx or index.html
  throw error;
}

export const supabase = supabaseClient;
