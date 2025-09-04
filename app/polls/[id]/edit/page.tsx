'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updatePoll, PollFormData } from '../../actions';
import { useAuth } from '@/context/auth-context';
import { supabase } from '../../database';

// Define the schema for poll editing (same as creation)
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100, { message: 'Title must be less than 100 characters' }),
  description: z.string().max(500, { message: 'Description must be less than 500 characters' }).optional().nullable(),
  options: z.array(
    z.object({
      id: z.string().optional(), // For existing options
      value: z.string().min(1, { message: 'Option cannot be empty' }).max(100, { message: 'Option must be less than 100 characters' })
    })
  ).min(2, { message: 'At least 2 options are required' })
});

// Poll data type
type Poll = {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  options: { id: string; value: string }[];
};

export default function EditPollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poll, setPoll] = useState<any>(null);
  
  // Define form with react-hook-form and zod validation
  const form = useForm<PollFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      options: []
    }
  });
  
  // Use fieldArray to handle dynamic options
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });

  // Fetch poll data
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        // Fetch poll data from Supabase
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('id, title, description, user_id')
          .eq('id', params.id)
          .single();
        
        if (pollError) throw new Error(`Error fetching poll: ${pollError.message}`);
        if (!pollData) throw new Error('Poll not found');
        
        // Fetch poll options
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('id, value')
          .eq('poll_id', params.id);
        
        if (optionsError) throw new Error(`Error fetching options: ${optionsError.message}`);
        
        // Combine poll and options data
        const fullPoll: Poll = {
          ...pollData,
          options: optionsData || []
        };
        
        setPoll(fullPoll);
        
        // Set form values
        form.reset({
          title: fullPoll.title,
          description: fullPoll.description || '',
          options: fullPoll.options
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching poll:', error);
        setError(error instanceof Error ? error.message : 'Failed to load poll data');
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [params.id, form]);

  const handleAddOption = () => {
    append({ value: '' });
  };

  const handleRemoveOption = (index: number) => {
    if (fields.length <= 2) return; // Minimum 2 options required
    remove(index);
  };

  const handleSubmit = async (values: PollFormData) => {    
    if (!user) {
      setError('You must be logged in to edit a poll');
      return;
    }
    
    if (!poll) {
      setError('Poll data not loaded');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await updatePoll(params.id, values, user.id);
      
      if (result.success) {
        router.push(`/polls/${params.id}`);
      } else {
        setError(typeof result.error === 'string' ? result.error : 'Failed to update poll');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error updating poll:', error);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Check if user is authorized to edit this poll
  const isAuthorized = user && poll && user.id === poll.user_id;

  if (authLoading || (isLoading && !poll)) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <p>Loading poll...</p>
      </div>
    );
  }

  if (!isAuthorized && !isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" className="mb-6" onClick={() => router.push(`/polls/${params.id}`)}>
          ← Back to Poll
        </Button>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Unauthorized</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                You are not authorized to edit this poll. Only the creator can edit it.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.push(`/polls/${params.id}`)}>
        ← Back to Poll
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Poll</CardTitle>
          <CardDescription>
            Make changes to your poll
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poll Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a question for your poll"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add more context to your question"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Poll Options</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddOption}
                  >
                    Add Option
                  </Button>
                </div>
                
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`options.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={`Option ${index + 1}`}
                            />
                          </FormControl>
                          {fields.length > 2 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveOption(index)}
                              className="px-2"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Updating Poll...' : 'Update Poll'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}