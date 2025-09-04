'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { setSessionTimeout } from '@/lib/session-management';

// Define the form schema with Zod
const formSchema = z.object({
  sessionTimeout: z.string().default('60'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const { user, session, refreshUserSession } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Define form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionTimeout: '60'
    }
  });

  // Handle session timeout update
  const handleUpdateSessionTimeout = async (values: FormValues) => {
    setIsUpdating(true);
    try {
      const sessionTimeoutMinutes = parseInt(values.sessionTimeout, 10);
      await setSessionTimeout(sessionTimeoutMinutes);
      await refreshUserSession();
      toast({
        title: 'Settings Updated',
        description: `Session timeout set to ${sessionTimeoutMinutes} minutes.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update session settings.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user || !session) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>You need to be signed in to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
          <CardDescription>Manage your session preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateSessionTimeout)} className="space-y-6">
              <FormField
                control={form.control}
                name="sessionTimeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Timeout</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session timeout" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                        <SelectItem value="720">12 hours</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Settings'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}