import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string;
          mechanic_name: string;
          contact_number: string;
          vehicle_number: string;
          complaint_type: string;
          spare_parts: SparePart[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mechanic_name: string;
          contact_number: string;
          vehicle_number: string;
          complaint_type: string;
          spare_parts: SparePart[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mechanic_name?: string;
          contact_number?: string;
          vehicle_number?: string;
          complaint_type?: string;
          spare_parts?: SparePart[];
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          part_number: string;
          buying_price: number;
          bought_from?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          part_number: string;
          buying_price: number;
          bought_from?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          part_number?: string;
          buying_price?: number;
          bought_from?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export interface SparePart {
  id: string;
  name: string;
  quantity: number;
}

export interface Entry {
  id: string;
  mechanicName: string;
  contactNumber: string;
  vehicleNumber: string;
  complaintType: string;
  spareParts: SparePart[];
  timestamp: Date;
}

export interface Product {
  id: string;
  name: string;
  partNumber: string;
  buyingPrice: number;
  boughtFrom?: string;
  timestamp: Date;
}