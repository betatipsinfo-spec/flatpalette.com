import { createClient } from "@supabase/supabase-js";

// ==========================================
// SUPABASE CONFIGURATION
// Replace the values below with your own Supabase project URL & Anon Key if needed.
// ==========================================
const SUPABASE_URL = "https://nqlkztsrnbvpxneacgsv.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_sQN5Azyw1uUv_LIzgBaUFg_f4OWEys_";

// Create and export a single, reusable Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
