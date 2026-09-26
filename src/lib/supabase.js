import { createClient } from '@supabase/supabase-js';

// Must be the SAME Supabase project URL/key used in the fire-dashboard-maplibre
// app's .env — that shared project is what makes this form and the dashboard
// one connected system.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
