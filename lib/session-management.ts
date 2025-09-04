import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

/**
 * Default session timeout in minutes
 */
const DEFAULT_SESSION_TIMEOUT = 60; // 1 hour

/**
 * Session management interface
 */
export interface SessionInfo {
  id: string;
  created_at: string;
  last_active_at: string;
  user_agent?: string;
  ip?: string;
  expires_at: string;
  is_current: boolean;
}

/**
 * Get the current session
 * @returns The current session or null if not authenticated
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting current session:', error);
    return null;
  }
  return data.session;
}

/**
 * Get all active sessions for the current user
 * @returns Array of session information
 */
export async function getAllSessions(): Promise<SessionInfo[]> {
  try {
    // Get current session for comparison
    const currentSession = await getCurrentSession();
    if (!currentSession) return [];
    
    // Get all sessions for the user
    const { data, error } = await supabase.auth.admin.listUserSessions(
      currentSession.user.id
    );
    
    if (error) throw error;
    
    if (!data || !data.sessions) return [];
    
    // Format session data
    return data.sessions.map(session => ({
      id: session.id,
      created_at: new Date(session.created_at).toISOString(),
      last_active_at: new Date().toISOString(), // Supabase doesn't provide this directly
      user_agent: session.user_agent || 'Unknown',
      ip: session.ip_address,
      expires_at: new Date(session.expires_at * 1000).toISOString(),
      is_current: session.id === currentSession.id
    }));
  } catch (error) {
    console.error('Error getting all sessions:', error);
    return [];
  }
}

/**
 * Revoke a specific session
 * @param sessionId The ID of the session to revoke
 * @returns True if successful, false otherwise
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.admin.deleteSession(sessionId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error revoking session:', error);
    return false;
  }
}

/**
 * Revoke all sessions except the current one
 * @returns True if successful, false otherwise
 */
export async function revokeAllOtherSessions(): Promise<boolean> {
  try {
    const currentSession = await getCurrentSession();
    if (!currentSession) return false;
    
    const { error } = await supabase.auth.admin.deleteSessionsForUser(
      currentSession.user.id,
      [currentSession.id] // Keep the current session
    );
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error revoking all other sessions:', error);
    return false;
  }
}

/**
 * Set a custom session timeout
 * @param minutes Number of minutes until session expiry
 * @returns True if successful, false otherwise
 */
export async function setSessionTimeout(minutes: number = DEFAULT_SESSION_TIMEOUT): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { session_timeout: minutes }
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting session timeout:', error);
    return false;
  }
}

/**
 * Refresh the current session
 * @returns The refreshed session or null if failed
 */
export async function refreshSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

/**
 * Check if the current session is expired or about to expire
 * @param warningMinutes Minutes before expiry to return true (default: 5)
 * @returns True if session is expired or about to expire
 */
export async function isSessionExpiringSoon(warningMinutes: number = 5): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session) return true;
  
  const expiresAt = new Date(session.expires_at * 1000);
  const warningTime = new Date(Date.now() + warningMinutes * 60 * 1000);
  
  return expiresAt <= warningTime;
}