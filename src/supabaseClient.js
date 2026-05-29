import { createClient } from "@supabase/supabase-js";

// =========================================================================
// SUPABASE CONNECTION CONFIGURATION
// Replace the values below with your specific Supabase Project URL and Public API Key
// =========================================================================
const SUPABASE_URL = "https://mltjvehaulvxbsgrqhwt.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_1pt7eQsZ2Lep7qpwuFB_rg_jFuFBD8M";

// Create and export the single reusable client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
