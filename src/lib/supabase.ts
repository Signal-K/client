import { createClient } from '@supabase/supabase-js'

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  /* v8 ignore next */
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  /* v8 ignore next */
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Client-side Supabase client (for use in components and client-side code)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Server-side Supabase client with service role (for use in API routes)
/* v8 ignore next 8 */
const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Type definitions for your database tables
interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      anomalies: {
        Row: {
          id: number
          content: any
          anomalytype: string
          avatar_url: string | null
          parentAnomaly: number | null
          configuration: any | null
          created_at: string
        }
        Insert: {
          id?: number
          content: any
          anomalytype: string
          avatar_url?: string | null
          parentAnomaly?: number | null
          configuration?: any | null
          created_at?: string
        }
        Update: {
          id?: number
          content?: any
          anomalytype?: string
          avatar_url?: string | null
          parentAnomaly?: number | null
          configuration?: any | null
          created_at?: string
        }
      }
      classifications: {
        Row: {
          id: number
          author: string
          anomaly: number
          classificationtype: string
          classificationconfiguration: any | null
          created_at: string
        }
        Insert: {
          id?: number
          author: string
          anomaly: number
          classificationtype: string
          classificationconfiguration?: any | null
          created_at?: string
        }
        Update: {
          id?: number
          author?: string
          anomaly?: number
          classificationtype?: string
          classificationconfiguration?: any | null
          created_at?: string
        }
      }
      // Add more table types as needed
    }
  }
}

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
