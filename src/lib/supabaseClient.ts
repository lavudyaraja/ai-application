import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "YOUR_SUPABASE_URL") {
  console.warn("Supabase credentials are not set in .env file. The app will be in a locked state. Please connect your Supabase project and add credentials.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
