'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Define the schema for poll creation and editing
const PollSchema = z.object({
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

export async function updatePoll(pollId: string, formData: PollFormData, userId: string) {
  try {
    // Validate the form data
    const validatedData = PollSchema.parse(formData);
    
    // Check if the user is the creator of the poll
    const { data: existingPoll, error: pollCheckError } = await supabase
      .from('polls')
      .select('user_id')
      .eq('id', pollId)
      .single();
    
    if (pollCheckError) throw new Error(`Error checking poll: ${pollCheckError.message}`);
    if (!existingPoll) throw new Error('Poll not found');
    
    // Authorization check: Ensure only the creator can edit the poll
    if (existingPoll.user_id !== userId) {
      return { success: false, error: 'Unauthorized: Only the creator can edit this poll' };
    }
    
    // Update the poll in the database
    const { error: pollUpdateError } = await supabase
      .from('polls')
      .update({
        title: validatedData.title,
        description: validatedData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', pollId);
    
    if (pollUpdateError) throw new Error(`Error updating poll: ${pollUpdateError.message}`);
    
    // Get existing options to determine which to update, delete, or create
    const { data: existingOptions, error: optionsError } = await supabase
      .from('options')
      .select('id, value')
      .eq('poll_id', pollId);
    
    if (optionsError) throw new Error(`Error fetching options: ${optionsError.message}`);
    
    // Create maps for easier processing
    const existingOptionsMap = new Map(existingOptions?.map(opt => [opt.id, opt]) || []);
    const newOptionsMap = new Map(validatedData.options
      .filter(opt => opt.id)
      .map(opt => [opt.id, opt]));
    
    // Options to update (existing options with changed values)
    const optionsToUpdate = validatedData.options
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
    const optionsToCreate = validatedData.options
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
        
        if (error) throw new Error(`Error updating option: ${error.message}`);
      }
    }
    
    if (optionsToDelete.length > 0) {
      const { error } = await supabase
        .from('options')
        .delete()
        .in('id', optionsToDelete);
      
      if (error) throw new Error(`Error deleting options: ${error.message}`);
    }
    
    if (optionsToCreate.length > 0) {
      const { error } = await supabase
        .from('options')
        .insert(optionsToCreate);
      
      if (error) throw new Error(`Error creating new options: ${error.message}`);
    }
    
    // Revalidate the polls page and the specific poll page
    revalidatePath('/polls');
    revalidatePath(`/polls/${pollId}`);
    
    return { success: true, pollId };
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