export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          address: string | null
          //userId: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          address?: string | null
          //userId?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          address?: string | null
          //userId?: string | null
        }
      }
      planets: {
        Row: {
          id: string
          userId: string | null // Should not be null in production
          temperature: number | null // For now, just 3 values: 0 = undefined, 1 = cool, 2 = warm
          radius: number | null // Measured in Earth radius ratio
          date: string | null // UNIX time format?
          ticId: string | null
          avatar_url: string | null
          screenshot: string | null // Link/ref to screenshot that was saved from the generator
          // We can add json types here, that could be useful for all the traits?
        }
        Insert: {
          id: string
          userId: string | null 
          temperature: number | null
          radius: number | null
          date: string | null
          ticId: string | null
          avatar_url: string | null
          screenshot: string | null
        }
        Update: {
          id: string
          userId: string | null 
          temperature: number | null
          radius: number | null
          date: string | null
          ticId: string | null
          avatar_url: string | null
          screenshot: string | null
        }
      }
      spaceships: {
        Row: {
          id: number
          owner: number | null
          name: string | null
          image: string | null
          hp: number | null
          attack: number | null
          speed: number | null
        }
        Insert: {
          id: number
          owner: number | null
          name: string | null
          image: string | null
          hp: number | null
          attack: number | null
          speed: number | null
        }
        Update: {
          id: number
          owner: number | null
          name: string | null
          image: string | null
          hp: number | null
          attack: number | null
          speed: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}