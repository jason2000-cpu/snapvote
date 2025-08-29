'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function CreatePollPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Define form with react-hook-form
  const form = useForm({
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

  const handleSubmit = async (values: any) => {    
    setIsLoading(true);
    
    try {
      // Simulate API call to create poll
      setTimeout(() => {
        // In a real app, this would be an API call
        console.log('Poll created:', values);
        setIsLoading(false);
        router.push('/polls');
      }, 1000);
    } catch (error) {
      console.error('Error creating poll:', error);
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
          </CardContent>
      </Card>
    </div>
  );
}