import { useState, useEffect, useCallback, useRef } from 'react';
import type { MatchedUser } from '@/api/type';
import { joinMatchingQueue, leaveMatchingQueue, endMatchingSession } from '@/api/matching';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8088';

interface UseMatchingReturn {
  status: 'idle' | 'waiting' | 'matched';
  sessionId: number | null;
  matchedUser: MatchedUser | null;
  similarityScore: number | null;
  isConnected: boolean;
  error: string | null;
  join: () => Promise<void>;
  leave: () => Promise<void>;
  endSession: () => Promise<void>;
  clearError: () => void;
}

export function useMatching(): UseMatchingReturn {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'matched'>('idle');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/matching/?token=${token}`);
    
    ws.onopen = () => {
      setIsConnected(true);

      ws.send(JSON.stringify({ action: 'status' }));
    };
    
    ws.onclose = () => {
      setIsConnected(false);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === 'error') {
        setError(data.message);
        return;
      }
      
      if (data.status && data.status !== 'error') {
        setStatus(data.status);
      }
      if (data.session_id !== undefined) {
        setSessionId(data.session_id);
      }
      if (data.matched_user !== undefined) {
        setMatchedUser(data.matched_user);
      }
      if (data.similarity_score !== undefined) {
        setSimilarityScore(data.similarity_score);
      }
    };
    
    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const join = useCallback(async () => {
    setError(null);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'join' }));
    } else {

      try {
        const result = await joinMatchingQueue();

        if (result.status === 'error') {
          setError(result.message);
          return;
        }
        
        setStatus(result.status as 'waiting' | 'matched');
        if (result.session_id) setSessionId(result.session_id);
        if (result.matched_user) setMatchedUser(result.matched_user);
        if (result.similarity_score) setSimilarityScore(result.similarity_score);
      } catch (err) {
        console.error('Failed to join queue:', err);
        setError('매칭 참가에 실패했습니다.');
      }
    }
  }, []);

  const leave = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'leave' }));
    } else {
      try {
        await leaveMatchingQueue();
        setStatus('idle');
        setSessionId(null);
        setMatchedUser(null);
        setSimilarityScore(null);
      } catch (error) {
        console.error('Failed to leave queue:', error);
      }
    }
  }, []);

  const endSession = useCallback(async () => {
    if (sessionId) {
      try {
        await endMatchingSession(sessionId);
        setStatus('idle');
        setSessionId(null);
        setMatchedUser(null);
        setSimilarityScore(null);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  }, [sessionId]);

  return {
    status,
    sessionId,
    matchedUser,
    similarityScore,
    isConnected,
    error,
    join,
    leave,
    endSession,
    clearError,
  };
}

