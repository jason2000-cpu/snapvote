'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createPoll, PollFormData } from '../actions';
import { useAuth } from '@/context/auth-context';

// Define the schema for poll creation
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100, { message: 'Title must be less than 100 characters' }),
  description: z.string().max(500, { message: 'Description must be less than 500 characters' }).optional().nullable(),
  options: z.array(
    z.object({
      value: z.string().min(1, { message: 'Option cannot be empty' }).max(100, { message: 'Option must be less than 100 characters' })
    })
  ).min(2, { message: 'At least 2 options are required' })
});

export default function CreatePollPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define form with react-hook-form and zod validation
  const form = useForm<PollFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      options: [
        { value: '' },
        { value: '' }
      ]
    }
  });
  
  // Use fieldArray to handle dynamic options
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });

  const handleAddOption = () => {
    append({ value: '' });
  };

  const handleRemoveOption = (index: number) => {
    if (fields.length <= 2) return; // Minimum 2 options required
    remove(index);
  };

  const handleSubmit = async (values: PollFormData) => {    
    if (!user) {
      setError('You must be logged in to create a poll');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createPoll(values, user.id);
      
      if (result.success) {
        router.push(`/polls/${result.pollId}`);
      } else {
        setError(typeof result.error === 'string' ? result.error : 'Failed to create poll');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.push('/polls')}>
        ← Back to Polls
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Poll</CardTitle>
          <CardDescription>
            Fill out the form below to create a new poll
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {authLoading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : !user ? (
            <Alert className="mb-6">
              <AlertDescription>
                You need to <a href="/auth/sign-in" className="font-medium underline">sign in</a> to create a poll.
              </AlertDescription>
            </Alert>
          ) : (
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
                {isLoading ? 'Creating Poll...' : 'Create Poll'}
              </Button>
            </form>
          </Form>
          )}
          </CardContent>
      </Card>
    </div>
  );
}