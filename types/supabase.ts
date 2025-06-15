export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: number
          username: string
          password_hash: string
          email: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          username: string
          password_hash: string
          email?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          username?: string
          password_hash?: string
          email?: string | null
          created_at?: string | null
        }
      }
      offer_products: {
        Row: {
          id: number
          offer_id: number
          sweet_id: number
        }
        Insert: {
          id?: number
          offer_id: number
          sweet_id: number
        }
        Update: {
          id?: number
          offer_id?: number
          sweet_id?: number
        }
      }
      offers: {
        Row: {
          id: number
          title: string
          description: string
          discount: number
          code: string
          start_date: string
          end_date: string
          is_active: boolean
          banner_color: string | null
          text_color: string | null
        }
        Insert: {
          id?: number
          title: string
          description: string
          discount: number
          code: string
          start_date: string
          end_date: string
          is_active?: boolean
          banner_color?: string | null
          text_color?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string
          discount?: number
          code?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          banner_color?: string | null
          text_color?: string | null
        }
      }
      sweet_sizes: {
        Row: {
          id: number
          sweet_id: number
          size: string
          price: number
        }
        Insert: {
          id?: number
          sweet_id: number
          size: string
          price: number
        }
        Update: {
          id?: number
          sweet_id?: number
          size?: string
          price?: number
        }
      }
      sweet_tags: {
        Row: {
          id: number
          sweet_id: number
          tag: string
        }
        Insert: {
          id?: number
          sweet_id: number
          tag: string
        }
        Update: {
          id?: number
          sweet_id?: number
          tag?: string
        }
      }
      sweets: {
        Row: {
          id: number
          name: string
          description: string
          image: string
          featured: boolean | null
        }
        Insert: {
          id?: number
          name: string
          description: string
          image: string
          featured?: boolean | null
        }
        Update: {
          id?: number
          name?: string
          description?: string
          image?: string
          featured?: boolean | null
        }
      }
    }
  }
}
