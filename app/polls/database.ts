/**
 * Centralized database client for poll-related operations
 * This file re-exports the Supabase client to avoid duplicate imports
 */

import { supabase } from '@/lib/supabase';

export { supabase };