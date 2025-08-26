
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://blayaierawkdesstthuf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsYXlhaWVyYXdrZGVzc3R0aHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzMwMTksImV4cCI6MjA3MTgwOTAxOX0.va_KGsOKitV-L1dCejfx1ygLq5lyqxd_LlqQWQmZOiw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsYXlhaWVyYXdrZGVzc3R0aHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMzAxOSwiZXhwIjoyMDcxODA5MDE5fQ.6Hw5xVF6g7nV2lBsvCs5uGQTPT52JG7_LEj0qKOoFew',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
