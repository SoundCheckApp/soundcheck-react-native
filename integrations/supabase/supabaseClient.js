import { createClient } from '@Supabase/supasbase-js';

const supabaseUrl = import.meta.env.supabaseUrl
const supabaseAnonKey = import.meta.env.supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey);