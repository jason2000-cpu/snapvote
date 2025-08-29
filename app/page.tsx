'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Redirect to polls page after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/polls');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to SnapVote</CardTitle>
          <CardDescription>
            Create and share polls with your friends and colleagues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">The easiest way to gather opinions and make decisions together.</p>
          <div className="flex flex-col gap-4 mt-6">
            <Button onClick={() => router.push('/polls')} size="lg">
              Browse Polls
            </Button>
            {user && (
              <Button onClick={() => router.push('/polls/create')} variant="outline" size="lg">
                Create a Poll
              </Button>
            )}
            {!user && (
              <Button onClick={() => router.push('/auth/sign-in')} variant="outline" size="lg">
                Sign In to Create Polls
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p>Redirecting to polls page...</p>
        </CardFooter>
      </Card>
    </div>
  );
}
