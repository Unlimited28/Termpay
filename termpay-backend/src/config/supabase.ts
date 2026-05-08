import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Admin client — uses service role key, bypasses RLS
// Use this for ALL backend operations
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Public client — uses anon key, respects RLS
// Only use for Supabase Auth operations
export const supabaseAuth = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey
)

// Test the connection
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('schools')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Supabase connection failed:', error.message)
      return false
    }

    console.log('✓ Supabase connection successful')
    return true
  } catch (err) {
    console.error('Supabase connection error:', err)
    return false
  }
}
