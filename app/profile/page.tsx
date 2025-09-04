'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionManagement } from '@/components/session-management';
import { useToast } from '@/components/ui/use-toast';
import { refreshSession } from '@/lib/session-management';

export default function ProfilePage() {
  const { user, session, refreshUserSession } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle session refresh
  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshUserSession();
      if (success) {
        toast({
          title: 'Session Refreshed',
          description: 'Your session has been successfully extended.',
        });
      } else {
        toast({
          title: 'Session Refresh Failed',
          description: 'Unable to refresh your session. Please try signing in again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while refreshing your session.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user || !session) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
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
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account and sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Account Information</h3>
              <p className="text-sm text-muted-foreground">Email: {user.email}</p>
              <p className="text-sm text-muted-foreground">
                Last Sign In: {new Date(user.last_sign_in_at || '').toLocaleString()}
              </p>
            </div>
            
            <div className="pt-2">
              <Button onClick={handleRefreshSession} disabled={isRefreshing}>
                {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SessionManagement />
    </div>
  );
}