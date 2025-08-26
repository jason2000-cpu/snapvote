'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Mock poll data types
type Option = {
  id: string;
  text: string;
  votes: number;
};

type Poll = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  options: Option[];
  totalVotes: number;
};

// Mock data for a single poll
const mockPoll: Poll = {
  id: '1',
  title: 'Favorite Programming Language',
  description: 'What programming language do you prefer to work with?',
  createdAt: '2023-06-15',
  options: [
    { id: 'opt1', text: 'JavaScript', votes: 45 },
    { id: 'opt2', text: 'Python', votes: 62 },
    { id: 'opt3', text: 'Java', votes: 23 },
    { id: 'opt4', text: 'C#', votes: 15 },
  ],
  totalVotes: 145,
};

export default function PollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch poll details
    const fetchPoll = async () => {
      try {
        // In a real app, this would be an API call using params.id
        setTimeout(() => {
          setPoll(mockPoll);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching poll:', error);
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [params.id]);

  const handleVote = () => {
    if (!selectedOption || !poll) return;

    // Simulate API call to submit vote
    setIsLoading(true);
    setTimeout(() => {
      // Update poll with new vote
      const updatedOptions = poll.options.map(option => {
        if (option.id === selectedOption) {
          return { ...option, votes: option.votes + 1 };
        }
        return option;
      });

      setPoll({
        ...poll,
        options: updatedOptions,
        totalVotes: poll.totalVotes + 1,
      });

      setHasVoted(true);
      setIsLoading(false);
    }, 500);
  };

  if (isLoading && !poll) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <p>Loading poll...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl">Poll not found</p>
        <Button className="mt-4" onClick={() => router.push('/polls')}>
          Back to Polls
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.push('/polls')}>
        ← Back to Polls
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <CardDescription>Created on {poll.createdAt}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">{poll.description}</p>

          <div className="space-y-4">
            {poll.options.map((option) => {
              const percentage = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;
                
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {!hasVoted && (
                      <input
                        type="radio"
                        id={option.id}
                        name="poll-option"
                        value={option.id}
                        onChange={() => setSelectedOption(option.id)}
                        checked={selectedOption === option.id}
                        className="h-4 w-4"
                      />
                    )}
                    <label 
                      htmlFor={option.id}
                      className={`flex-1 ${hasVoted ? 'font-medium' : ''}`}
                    >
                      {option.text}
                    </label>
                    {hasVoted && (
                      <span className="text-sm font-medium">{percentage}%</span>
                    )}
                  </div>
                  
                  {hasVoted && (
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          {!hasVoted ? (
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption || isLoading}
              className="w-full"
            >
              {isLoading ? 'Submitting...' : 'Vote'}
            </Button>
          ) : (
            <p className="text-center w-full text-muted-foreground">
              Thank you for voting! Total votes: {poll.totalVotes}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}