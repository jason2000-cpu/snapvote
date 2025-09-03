import { supabase } from '@/lib/supabase';
import { ActionResponse, Poll, PollInsert, Option, OptionInsert } from './types';
import { PollFormData } from './validation';

/**
 * Creates a new poll in the database
 * @param pollData Validated poll data
 * @param userId ID of the user creating the poll
 * @returns ActionResponse with the created poll ID
 */
export async function createPollInDb(pollData: PollFormData, userId: string): Promise<ActionResponse<{ pollId: string }>> {
  try {
    // Insert the poll into the database
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: pollData.title,
        description: pollData.description,
        user_id: userId
      })
      .select('id')
      .single();
    
    if (pollError) {
      return { 
        success: false, 
        error: `Error creating poll: ${pollError.message}` 
      };
    }
    
    if (!poll) {
      return { 
        success: false, 
        error: 'Failed to create poll' 
      };
    }
    
    // Insert the options
    const optionsToInsert = pollData.options.map(option => ({
      poll_id: poll.id,
      value: option.value
    }));
    
    const { error: optionsError } = await supabase
      .from('options')
      .insert(optionsToInsert);
    
    if (optionsError) {
      return { 
        success: false, 
        error: `Error creating options: ${optionsError.message}` 
      };
    }
    
    return { success: true, data: { pollId: poll.id } };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Updates an existing poll in the database
 * @param pollId ID of the poll to update
 * @param pollData Validated poll data
 * @returns ActionResponse with the updated poll ID
 */
export async function updatePollInDb(pollId: string, pollData: PollFormData): Promise<ActionResponse<{ pollId: string }>> {
  try {
    // Update the poll in the database
    const { error: pollUpdateError } = await supabase
      .from('polls')
      .update({
        title: pollData.title,
        description: pollData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', pollId);
    
    if (pollUpdateError) {
      return { 
        success: false, 
        error: `Error updating poll: ${pollUpdateError.message}` 
      };
    }
    
    // Get existing options to determine which to update, delete, or create
    const { data: existingOptions, error: optionsError } = await supabase
      .from('options')
      .select('id, value')
      .eq('poll_id', pollId);
    
    if (optionsError) {
      return { 
        success: false, 
        error: `Error fetching options: ${optionsError.message}` 
      };
    }
    
    // Create maps for easier processing
    const existingOptionsMap = new Map(existingOptions?.map(opt => [opt.id, opt]) || []);
    const newOptionsMap = new Map(pollData.options
      .filter(opt => opt.id)
      .map(opt => [opt.id, opt]));
    
    // Options to update (existing options with changed values)
    const optionsToUpdate = pollData.options
      .filter(opt => opt.id && existingOptionsMap.has(opt.id))
      .filter(opt => existingOptionsMap.get(opt.id)?.value !== opt.value)
      .map(opt => ({
        id: opt.id,
        value: opt.value
      }));
    
    // Options to delete (options in DB but not in the form submission)
    const optionsToDelete = existingOptions
      ?.filter(opt => !newOptionsMap.has(opt.id))
      .map(opt => opt.id) || [];
    
    // Options to create (options in form without IDs)
    const optionsToCreate = pollData.options
      .filter(opt => !opt.id)
      .map(opt => ({
        poll_id: pollId,
        value: opt.value
      }));
    
    // Execute updates, deletes, and inserts
    if (optionsToUpdate.length > 0) {
      for (const option of optionsToUpdate) {
        const { error } = await supabase
          .from('options')
          .update({ value: option.value })
          .eq('id', option.id);
        
        if (error) {
          return { 
            success: false, 
            error: `Error updating option: ${error.message}` 
          };
        }
      }
    }
    
    if (optionsToDelete.length > 0) {
      const { error } = await supabase
        .from('options')
        .delete()
        .in('id', optionsToDelete);
      
      if (error) {
        return { 
          success: false, 
          error: `Error deleting options: ${error.message}` 
        };
      }
    }
    
    if (optionsToCreate.length > 0) {
      const { error } = await supabase
        .from('options')
        .insert(optionsToCreate);
      
      if (error) {
        return { 
          success: false, 
          error: `Error creating new options: ${error.message}` 
        };
      }
    }
    
    return { success: true, data: { pollId } };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Fetches a poll by ID
 * @param pollId ID of the poll to fetch
 * @returns ActionResponse with the poll data
 */
export async function getPollById(pollId: string): Promise<ActionResponse<Poll>> {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();
      
    if (error) {
      return { 
        success: false, 
        error: `Error fetching poll: ${error.message}` 
      };
    }
    
    if (!data) {
      return { 
        success: false, 
        error: 'Poll not found' 
      };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}