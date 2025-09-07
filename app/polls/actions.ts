'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Import from our new modules
import { PollFormData } from './validation';
import { validatePollData } from './validation';
import { checkPollAuthorization, validateUserId } from './auth';
import { createPollInDb, updatePollInDb } from './db';
import { handleActionError, createErrorResponse, createSuccessResponse } from './errors';
import { ActionResponse } from './types';

/**
 * Creates a new poll with the provided form data and associates it with the specified user.
 * 
 * This function is a critical server action that handles the creation of polls in the application.
 * It performs validation of both the user ID and poll form data before creating the poll in the database.
 * On success, it revalidates the polls page to ensure fresh data is displayed.
 * 
 * @param formData - The validated poll data containing title, description, and options
 * @param userId - The ID of the authenticated user creating the poll
 * @returns A promise resolving to an ActionResponse containing the created poll ID or error information
 * 
 * @usage This function is primarily used in:
 * - /app/polls/create/page.tsx: Called when a user submits the poll creation form
 * - It's also tested extensively in /app/polls/actions.test.ts
 */
export async function createPoll(formData: PollFormData, userId: string): Promise<ActionResponse<{ pollId: string }>> {
  try {
    // Validate user ID
    const userIdResult = validateUserId(userId);
    if (!userIdResult.success) {
      return userIdResult as ActionResponse<never>;
    }
    
    // Validate the form data
    const validationResult = validatePollData(formData);
    if (!validationResult.success) {
      return validationResult as ActionResponse<never>;
    }
    
    // Create poll in database
    const result = await createPollInDb(validationResult.data, userId);
    
    // Revalidate the polls page on success
    if (result.success) {
      revalidatePath('/polls');
    }
    
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Updates an existing poll with the provided form data after verifying user authorization.
 * 
 * This function is a critical server action that handles the editing of existing polls.
 * It performs multiple validation steps:
 * 1. Validates the user ID is provided
 * 2. Validates the poll form data structure and content
 * 3. Verifies the user is authorized to edit this specific poll (must be the creator)
 * On success, it revalidates both the polls list page and the specific poll page.
 * 
 * @param pollId - The ID of the poll to update
 * @param formData - The validated poll data containing updated title, description, and options
 * @param userId - The ID of the authenticated user attempting to update the poll
 * @returns A promise resolving to an ActionResponse containing the updated poll ID or error information
 * 
 * @usage This function is primarily used in:
 * - /app/polls/[id]/edit/page.tsx: Called when a user submits the poll edit form
 * - It's also tested extensively in /app/polls/actions.test.ts
 * - The function is part of the poll editing security flow described in /docs/poll-editing.md
 */
export async function updatePoll(pollId: string, formData: PollFormData, userId: string): Promise<ActionResponse<{ pollId: string }>> {
  try {
    // Validate user ID
    const userIdResult = validateUserId(userId);
    if (!userIdResult.success) {
      return userIdResult as ActionResponse<never>;
    }
    
    // Validate the form data
    const validationResult = validatePollData(formData);
    if (!validationResult.success) {
      return validationResult as ActionResponse<never>;
    }
    
    // Check authorization
    const authResult = await checkPollAuthorization(pollId, userId);
    if (!authResult.success) {
      return authResult as ActionResponse<never>;
    }
    
    // Update poll in database
    const result = await updatePollInDb(pollId, validationResult.data);
    
    // Revalidate the polls page and the specific poll page on success
    if (result.success) {
      revalidatePath('/polls');
      revalidatePath(`/polls/${pollId}`);
    }
    
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}