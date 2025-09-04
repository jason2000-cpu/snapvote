'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { supabase } from '../database';

// Poll data types
type Option = {
  id: string;
  text: string;
  value: string;
  votes: number;
};

type Poll = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  user_id: string;
  options: Option[];
  totalVotes: number;
};

export default function PollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the current user is the creator of the poll
  const isCreator = user && poll?.user_id === user.id;

  useEffect(() => {
    // Fetch poll details from Supabase
    const fetchPoll = async () => {
      try {
        // Fetch poll data
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('id, title, description, created_at, user_id')
          .eq('id', params.id)
          .single();
        
        if (pollError) throw new Error(`Error fetching poll: ${pollError.message}`);
        if (!pollData) throw new Error('Poll not found');
        
        // Fetch poll options with votes
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('id, value, votes')
          .eq('poll_id', params.id);
        
        if (optionsError) throw new Error(`Error fetching options: ${optionsError.message}`);
        
        // Calculate total votes
        const totalVotes = optionsData?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0;
        
        // Format options for display
        const formattedOptions = optionsData?.map(option => ({
          id: option.id,
          text: option.value,
          value: option.value,
          votes: option.votes || 0
        })) || [];
        
        // Combine poll and options data
        const fullPoll: Poll = {
          ...pollData,
          options: formattedOptions,
          totalVotes
        };
        
        setPoll(fullPoll);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching poll:', error);
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [params.id]);

  const handleVote = async () => {
    if (!selectedOption || !poll) return;

    setIsLoading(true);
    try {
      // Update vote count in Supabase
      const { error } = await supabase.rpc('increment_vote', {
        option_id: selectedOption
      });
      
      if (error) throw new Error(`Error submitting vote: ${error.message}`);
      
      // Update local state with new vote
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
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit vote');
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.push('/polls')}>
          ← Back to Polls
        </Button>
        
        {isCreator && (
          <Link href={`/polls/${params.id}/edit`}>
            <Button variant="outline">Edit Poll</Button>
          </Link>
        )}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <CardDescription>Created on {new Date(poll.created_at).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
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