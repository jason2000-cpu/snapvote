'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Mock poll data type
type Poll = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  votesCount: number;
};

// Mock data for polls
const mockPolls: Poll[] = [
  {
    id: '1',
    title: 'Favorite Programming Language',
    description: 'What programming language do you prefer to work with?',
    createdAt: '2023-06-15',
    votesCount: 145,
  },
  {
    id: '2',
    title: 'Best Frontend Framework',
    description: 'Which frontend framework do you think is the best?',
    createdAt: '2023-06-10',
    votesCount: 89,
  },
  {
    id: '3',
    title: 'Remote Work Preferences',
    description: 'Do you prefer working remotely or in an office?',
    createdAt: '2023-06-05',
    votesCount: 210,
  },
];

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch polls
    const fetchPolls = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setPolls(mockPolls);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching polls:', error);
        setIsLoading(false);
      }
    };

    fetchPolls();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Polls</h1>
        <Link href="/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading polls...</p>
        </div>
      ) : polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No polls available</p>
          <p className="mt-2">Be the first to create a poll!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <Link href={`/polls/${poll.id}`} key={poll.id} className="block">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{poll.title}</CardTitle>
                  <CardDescription>Created on {poll.createdAt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{poll.description}</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">{poll.votesCount} votes</p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}