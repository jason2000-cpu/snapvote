'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllSessions, revokeSession, revokeAllOtherSessions, SessionInfo } from '@/lib/session-management';
import { useToast } from '@/components/ui/use-toast';

export function SessionManagement() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { toast } = useToast();

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Function to load all sessions
  const loadSessions = async () => {
    setLoading(true);
    try {
      const sessionData = await getAllSessions();
      setSessions(sessionData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load active sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to revoke a specific session
  const handleRevokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const success = await revokeSession(sessionId);
      if (success) {
        toast({
          title: 'Success',
          description: 'Session revoked successfully',
        });
        // Reload sessions to update the list
        loadSessions();
      } else {
        throw new Error('Failed to revoke session');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive',
      });
    } finally {
      setRevoking(null);
    }
  };

  // Function to revoke all other sessions
  const handleRevokeAllOtherSessions = async () => {
    setRevoking('all');
    try {
      const success = await revokeAllOtherSessions();
      if (success) {
        toast({
          title: 'Success',
          description: 'All other sessions revoked successfully',
        });
        // Reload sessions to update the list
        loadSessions();
      } else {
        throw new Error('Failed to revoke other sessions');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke other sessions',
        variant: 'destructive',
      });
    } finally {
      setRevoking(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active login sessions across devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-4">No active sessions found</div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-md"
              >
                <div className="space-y-1 mb-2 md:mb-0">
                  <div className="font-medium flex items-center">
                    {session.is_current && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                    {session.user_agent}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    IP: {session.ip || 'Unknown'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created: {formatDate(session.created_at)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expires: {formatDate(session.expires_at)}
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revoking !== null}
                  >
                    {revoking === session.id ? 'Revoking...' : 'Revoke'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={loadSessions}
          disabled={loading || revoking !== null}
        >
          Refresh
        </Button>
        <Button
          variant="destructive"
          onClick={handleRevokeAllOtherSessions}
          disabled={loading || revoking !== null || sessions.filter(s => !s.is_current).length === 0}
        >
          {revoking === 'all' ? 'Revoking...' : 'Revoke All Other Sessions'}
        </Button>
      </CardFooter>
    </Card>
  );
}