import { createClient } from '@supabase/supabase-js'

export const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export const generateTestEmail = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${process.env.TEST_USER_EMAIL_PREFIX || 'test'}-${timestamp}-${random}@example.com`
}

export const createTestUser = async () => {
  const email = generateTestEmail()
  const password = 'testPassword123!'
  
  const { data, error } = await testSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  if (error) throw error
  return { user: data.user, email, password }
}

export const cleanupTestUser = async (userId: string) => {
  await testSupabase.auth.admin.deleteUser(userId)
}