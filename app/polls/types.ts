import { z } from 'zod';
import { Database } from '@/lib/database.types';

// Database types
export type Poll = Database['public']['Tables']['polls']['Row'];
export type PollInsert = Database['public']['Tables']['polls']['Insert'];
export type PollUpdate = Database['public']['Tables']['polls']['Update'];

export type Option = Database['public']['Tables']['options']['Row'];
export type OptionInsert = Database['public']['Tables']['options']['Insert'];
export type OptionUpdate = Database['public']['Tables']['options']['Update'];

export type Vote = Database['public']['Tables']['votes']['Row'];
export type VoteInsert = Database['public']['Tables']['votes']['Insert'];

// UI types
export type PollWithOptions = Poll & {
  options: Option[];
  totalVotes?: number;
};

// Response types
export type ActionResponse<T = unknown> = {
  success: boolean;
  error?: string | z.ZodError | unknown;
} & ({
  success: true;
  data: T;
} | {
  success: false;
  data?: never;
});