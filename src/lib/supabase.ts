import.meta.env.VITE_API_URL import { createClient } from '@supabase/supabase-js';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
import.meta.env.VITE_API_URL const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL let supabaseClient;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL try {
import.meta.env.VITE_API_URL   if (!supabaseUrl || !supabaseAnonKey) {
import.meta.env.VITE_API_URL     throw new Error("Supabase URL or Anon Key is missing");
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL   supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
import.meta.env.VITE_API_URL   console.log("Supabase client initialized successfully.");
import.meta.env.VITE_API_URL } catch (error) {
import.meta.env.VITE_API_URL   console.error("Failed to initialize Supabase client:", error);
import.meta.env.VITE_API_URL   // Re-throw to be caught by main.tsx or index.html
import.meta.env.VITE_API_URL   throw error;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export const supabase = supabaseClient;
