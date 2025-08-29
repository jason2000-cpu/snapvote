'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Define the schema for poll creation
const PollSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100, { message: 'Title must be less than 100 characters' }),
  description: z.string().max(500, { message: 'Description must be less than 500 characters' }).optional().nullable(),
  options: z.array(
    z.object({
      value: z.string().min(1, { message: 'Option cannot be empty' }).max(100, { message: 'Option must be less than 100 characters' })
    })
  ).min(2, { message: 'At least 2 options are required' })
});

export type PollFormData = z.infer<typeof PollSchema>;

export async function createPoll(formData: PollFormData, userId: string) {
  try {
    // Validate the form data
    const validatedData = PollSchema.parse(formData);
    
    // Insert the poll into the database
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: validatedData.title,
        description: validatedData.description,
        user_id: userId
      })
      .select('id')
      .single();
    
    if (pollError) throw new Error(`Error creating poll: ${pollError.message}`);
    if (!poll) throw new Error('Failed to create poll');
    
    // Insert the options
    const optionsToInsert = validatedData.options.map(option => ({
      poll_id: poll.id,
      value: option.value
    }));
    
    const { error: optionsError } = await supabase
      .from('options')
      .insert(optionsToInsert);
    
    if (optionsError) throw new Error(`Error creating options: ${optionsError.message}`);
    
    // Revalidate the polls page and redirect
    revalidatePath('/polls');
    return { success: true, pollId: poll.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'An unknown error occurred' };
  }
}