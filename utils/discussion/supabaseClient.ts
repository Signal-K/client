import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define types for environment variables
type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
};

declare const process: {
  env: Env;
};

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
  process.env;

// Create a type for the Supabase client
type MySupabaseClient = SupabaseClient;

export const supabase: MySupabaseClient = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
);