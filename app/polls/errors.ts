import { z } from 'zod';
import { ActionResponse } from './types';

/**
 * Standardizes error handling for server actions
 * @param error The error object to process
 * @returns A standardized ActionResponse with appropriate error information
 */
export function handleActionError(error: unknown): ActionResponse<never> {
  if (error instanceof z.ZodError) {
    return { 
      success: false, 
      error: error.errors 
    };
  }
  
  if (error instanceof Error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
  
  return { 
    success: false, 
    error: 'An unknown error occurred' 
  };
}

/**
 * Creates a standardized error response
 * @param message The error message
 * @returns A standardized ActionResponse with the error message
 */
export function createErrorResponse(message: string): ActionResponse<never> {
  return {
    success: false,
    error: message
  };
}

/**
 * Creates a standardized success response
 * @param data The data to include in the response
 * @returns A standardized ActionResponse with the provided data
 */
export function createSuccessResponse<T>(data: T): ActionResponse<T> {
  return {
    success: true,
    data
  };
}