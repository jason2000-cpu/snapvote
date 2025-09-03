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