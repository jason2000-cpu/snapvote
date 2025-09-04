import { supabase } from './database';
import { ActionResponse } from './types';

/**
 * Checks if a user is authorized to modify a poll
 * @param pollId The ID of the poll to check
 * @param userId The ID of the user attempting the action
 * @returns An ActionResponse indicating authorization status
 */
export async function checkPollAuthorization(pollId: string, userId: string): Promise<ActionResponse<boolean>> {
  try {
    // Check if the user is the creator of the poll
    const { data: existingPoll, error: pollCheckError } = await supabase
      .from('polls')
      .select('user_id')
      .eq('id', pollId)
      .single();
    
    if (pollCheckError) {
      return { 
        success: false, 
        error: `Error checking poll: ${pollCheckError.message}` 
      };
    }
    
    if (!existingPoll) {
      return { 
        success: false, 
        error: 'Poll not found' 
      };
    }
    
    // Authorization check: Ensure only the creator can edit the poll
    if (existingPoll.user_id !== userId) {
      return { 
        success: false, 
        error: 'Unauthorized: Only the creator can edit this poll' 
      };
    }
    
    return { success: true, data: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authorization check failed' 
    };
  }
}

/**
 * Validates that a user ID is provided
 * @param userId The user ID to validate
 * @returns An ActionResponse indicating if the user ID is valid
 */
export function validateUserId(userId: string | undefined | null): ActionResponse<string> {
  if (!userId) {
    return { 
      success: false, 
      error: 'User must be authenticated to perform this action' 
    };
  }
  
  return { success: true, data: userId };
}