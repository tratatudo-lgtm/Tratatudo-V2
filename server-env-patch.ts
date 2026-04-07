// === INÍCIO PATCH SUPABASE ===
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_KEY não definidos no .env');
  process.exit(1);
}

import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(supabaseUrl, supabaseKey);
// === FIM PATCH SUPABASE ===
