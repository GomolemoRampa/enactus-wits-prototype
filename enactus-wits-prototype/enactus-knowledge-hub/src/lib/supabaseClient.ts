/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env) and Node/standard process.env environments
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

const supabaseUrl: string =
  env.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_SUPABASE_URL) ||
  '';

const supabaseAnonKey: string =
  env.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_SUPABASE_ANON_KEY) ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
