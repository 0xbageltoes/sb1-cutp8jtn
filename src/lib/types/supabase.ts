export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      instruments_primary: {
        Row: {
          id: string
          name: string
          current_balance: number | null
          interest_rate: number | null
          stated_rate: number | null
          penalty_rate: number | null
          rate_type: string | null
          rate_floor: number | null
          term: number | null
          remaining_term: number | null
          payment_day: number | null
          collateral: string | null
          collateral_type: string | null
          lien_status: string | null
          lien_jurisdiction: string | null
          status: string | null
          start_date: string | null
          maturity_date: string | null
          next_payment: string | null
          origination_date: string | null
          purchase_date: string | null
          servicer: string | null
          subservicer: string | null
          originator: string | null
          originator_parent: string | null
          channel: string | null
          risk_score: number | null
          default_rate: number | null
          total_modifications: number | null
          modification_percent: number | null
          agreement_type: string | null
          governing_law: string | null
          amortization_type: string | null
        }
        Insert: {
          id: string
          name: string
          current_balance?: number | null
          interest_rate?: number | null
          stated_rate?: number | null
          penalty_rate?: number | null
          rate_type?: string | null
          rate_floor?: number | null
          term?: number | null
          remaining_term?: number | null
          payment_day?: number | null
          collateral?: string | null
          collateral_type?: string | null
          lien_status?: string | null
          lien_jurisdiction?: string | null
          status?: string | null
          start_date?: string | null
          maturity_date?: string | null
          next_payment?: string | null
          origination_date?: string | null
          purchase_date?: string | null
          servicer?: string | null
          subservicer?: string | null
          originator?: string | null
          originator_parent?: string | null
          channel?: string | null
          risk_score?: number | null
          default_rate?: number | null
          total_modifications?: number | null
          modification_percent?: number | null
          agreement_type?: string | null
          governing_law?: string | null
          amortization_type?: string | null
        }
        Update: {
          id?: string
          name?: string
          current_balance?: number | null
          interest_rate?: number | null
          stated_rate?: number | null
          penalty_rate?: number | null
          rate_type?: string | null
          rate_floor?: number | null
          term?: number | null
          remaining_term?: number | null
          payment_day?: number | null
          collateral?: string | null
          collateral_type?: string | null
          lien_status?: string | null
          lien_jurisdiction?: string | null
          status?: string | null
          start_date?: string | null
          maturity_date?: string | null
          next_payment?: string | null
          origination_date?: string | null
          purchase_date?: string | null
          servicer?: string | null
          subservicer?: string | null
          originator?: string | null
          originator_parent?: string | null
          channel?: string | null
          risk_score?: number | null
          default_rate?: number | null
          total_modifications?: number | null
          modification_percent?: number | null
          agreement_type?: string | null
          governing_law?: string | null
          amortization_type?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          banner_url: string | null
          theme: 'light' | 'dark'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          theme?: 'light' | 'dark'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          theme?: 'light' | 'dark'
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          last_active_at?: string
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