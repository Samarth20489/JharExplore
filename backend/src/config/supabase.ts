import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

// Use anon key as fallback for development
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeGR3cnBsanllanVwa3NyZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzI4ODQsImV4cCI6MjA5MjQ0ODg4NH0.V1vYMiqOHhAM1UpvocLa_p0I95X6nQlLCdoAYI1pDXs';

const effectiveKey = supabaseKey && supabaseKey !== 'REPLACE_WITH_YOUR_SERVICE_ROLE_KEY'
  ? supabaseKey
  : ANON_KEY;

export const supabase = createClient(supabaseUrl, effectiveKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
