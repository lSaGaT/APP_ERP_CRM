import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tpfybaoelaebkhbkkocl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZnliYW9lbGFlYmtoYmtrb2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDQyNDEsImV4cCI6MjA5MDI4MDI0MX0.RkrKV_DNn-bUGc1L99eOsA_rm8n7CDKAqqNV0-IsvKw';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
