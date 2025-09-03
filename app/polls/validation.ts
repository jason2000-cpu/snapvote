import { z } from 'zod';
import { ActionResponse } from './types';

// Define the schema for poll creation and editing
export const PollSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100, { message: 'Title must be less than 100 characters' }),
  description: z.string().max(500, { message: 'Description must be less than 500 characters' }).optional().nullable(),
  options: z.array(
    z.object({
      id: z.string().optional(), // For existing options
      value: z.string().min(1, { message: 'Option cannot be empty' }).max(100, { message: 'Option must be less than 100 characters' })
    })
  ).min(2, { message: 'At least 2 options are required' })
});

export type PollFormData = z.infer<typeof PollSchema>;

/**
 * Validates poll data against the schema
 * @param data The poll data to validate
 * @returns A validated data object or throws a ZodError
 */
export function validatePollData(data: PollFormData): ActionResponse<PollFormData> {
  try {
    const validatedData = PollSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: 'Validation failed' };
  }
}