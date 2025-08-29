// This is a placeholder for your Supabase database types
// You can generate these types using the Supabase CLI
// https://supabase.com/docs/guides/api/generating-types

export type Database = {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          user_id?: string;
        };
      };
      options: {
        Row: {
          id: string;
          poll_id: string;
          value: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          value: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          value?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          option_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          option_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          option_id?: string;
          created_at?: string;
        };
      };
    };
  };
};