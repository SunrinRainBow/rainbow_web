import { useState, useEffect, useCallback, useRef } from 'react';
import type { MatchedUser } from '@/api/type';

const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8088').replace(/\/$/, '');

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

type RoomStatus = 'idle' | 'waiting' | 'matched' | 'connected';

interface UseRoomReturn {
  status: RoomStatus;
  sessionId: number | null;
  matchedUser: MatchedUser | null;
  similarityScore: number | null;
  role: 'initiator' | 'receiver' | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isWsConnected: boolean;
  error: string | null;
  join: () => Promise<void>;
  leave: () => Promise<void>;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  clearError: () => void;
  setDeepARStream: (stream: MediaStream) => void;
}

export function useRoom(): UseRoomReturn {
  const [status, setStatus] = useState<RoomStatus>('idle');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [role, setRole] = useState<'initiator' | 'receiver' | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const deepARStreamRef = useRef<MediaStream | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get local stream:', err);
      setError('카메라/마이크 접근에 실패했습니다.');
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback((ws: WebSocket) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          data: event.candidate,
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
        setStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received:', event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    const deepARStream = deepARStreamRef.current;
    const localStream = localStreamRef.current;

    if (deepARStream) {
      const videoTrack = deepARStream.getVideoTracks()[0];
      if (videoTrack) {
        console.log('Adding DeepAR video track to peer connection');
        pc.addTrack(videoTrack, deepARStream);
      }
      
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          console.log('Adding local audio track to peer connection');
          pc.addTrack(audioTrack, localStream);
        }
      }
    } else if (localStream) {
      console.log('No DeepAR stream, using local stream');
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  const handleSignalingMessage = useCallback(async (message: { type: string; data: unknown; sender_id?: number }) => {
    const ws = wsRef.current;
    if (!ws) return;

    let pc = peerConnectionRef.current;

    switch (message.type) {
      case 'offer': {
        console.log('Received offer, creating answer...');
        if (!pc) {
          pc = createPeerConnection(ws);
        }
        await pc.setRemoteDescription(new RTCSessionDescription(message.data as RTCSessionDescriptionInit));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({
          type: 'answer',
          data: answer,
        }));
        break;
      }

      case 'answer':
        console.log('Received answer');
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(message.data as RTCSessionDescriptionInit));
        }
        break;

      case 'ice-candidate':
        console.log('Received ICE candidate');
        if (pc && message.data) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(message.data as RTCIceCandidateInit));
          } catch (err) {
            console.error('Failed to add ICE candidate:', err);
          }
        }
        break;
    }
  }, [createPeerConnection]);

  const cleanupCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token, skipping WebSocket connection');
      return;
    }

    console.log('Connecting to WebSocket:', `${WS_BASE_URL}/ws/room/?token=${token.substring(0, 20)}...`);

    const ws = new WebSocket(`${WS_BASE_URL}/ws/room/?token=${token}`);

    const handleBeforeUnload = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'end-call' }));
        ws.send(JSON.stringify({ action: 'leave' }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    ws.onopen = () => {
      console.log('WebSocket connected!');
      setIsWsConnected(true);
      setError(null);
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsWsConnected(false);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
      }, 3000);
    };
    
    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('서버 연결에 실패했습니다.');
    };
    
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);

      if (data.status === 'error' || data.type === 'error') {
        setError(data.message);
        return;
      }

      switch (data.type || data.status) {
        case 'idle':
          setStatus('idle');
          setSessionId(null);
          setMatchedUser(null);
          setSimilarityScore(null);
          setRole(null);
          break;

        case 'waiting':
          setStatus('waiting');
          break;

        case 'matched':
          setStatus('matched');
          if (data.session_id) setSessionId(data.session_id);
          if (data.matched_user) setMatchedUser(data.matched_user);
          if (data.similarity_score) setSimilarityScore(data.similarity_score);
          break;

        case 'room-joined':
          console.log('Room joined, role:', data.role);
          setRole(data.role);
          setSessionId(data.session_id);
          break;

        case 'room-ready':
          console.log('Room ready! Role:', data.role);
          setRole(data.role);
          
          try {
            await getLocalStream();
            
            if (data.role === 'initiator') {
              console.log('I am initiator, creating offer...');
              const pc = createPeerConnection(ws);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              ws.send(JSON.stringify({
                type: 'offer',
                data: offer,
              }));
            } else {
              console.log('I am receiver, waiting for offer...');
              createPeerConnection(ws);
            }
          } catch (err) {
            console.error('Failed to setup WebRTC:', err);
          }
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          await handleSignalingMessage(data);
          break;

        case 'peer-disconnected':
          console.log('Peer disconnected');
          setRemoteStream(null);
          setIsConnected(false);
          break;

        case 'call-ended':
          console.log('Call ended by peer');
          cleanupCall();
          setStatus('idle');
          setSessionId(null);
          setMatchedUser(null);
          setRole(null);
          break;

        default:
          if (data.status && ['idle', 'waiting', 'matched'].includes(data.status)) {
            setStatus(data.status as RoomStatus);
            if (data.session_id !== undefined) setSessionId(data.session_id);
            if (data.matched_user !== undefined) setMatchedUser(data.matched_user);
            if (data.similarity_score !== undefined) setSimilarityScore(data.similarity_score);
          }
      }
    };
    
    wsRef.current = ws;

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'end-call' }));
        ws.send(JSON.stringify({ action: 'leave' }));
        ws.close();
      } else if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [getLocalStream, createPeerConnection, handleSignalingMessage, cleanupCall]);

  const join = useCallback(async () => {
    setError(null);
    
    try {
      await getLocalStream();
    } catch {
      return;
    }
    
    const ws = wsRef.current;
    console.log('Join called, ws state:', ws?.readyState, 'OPEN:', WebSocket.OPEN);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Sending join message...');
      ws.send(JSON.stringify({ action: 'join' }));
    } else {
      console.error('WebSocket not connected, state:', ws?.readyState);
      setError('서버에 연결되지 않았습니다. 페이지를 새로고침해주세요.');
    }
  }, [getLocalStream]);

  const leave = useCallback(async () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'leave' }));
    }
    setStatus('idle');
    setSessionId(null);
    setMatchedUser(null);
    setSimilarityScore(null);
    setRole(null);
  }, []);

  const endCall = useCallback(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'end-call' }));
    }
    
    cleanupCall();
    setStatus('idle');
    setSessionId(null);
    setMatchedUser(null);
    setSimilarityScore(null);
    setRole(null);
  }, [cleanupCall]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const setDeepARStream = useCallback((stream: MediaStream) => {
    console.log('DeepAR stream set:', stream);
    deepARStreamRef.current = stream;
    
    // 이미 peer connection이 있으면 트랙 추가
    const pc = peerConnectionRef.current;
    if (pc) {
      // 기존 비디오 트랙 제거
      const senders = pc.getSenders();
      const videoSender = senders.find(s => s.track?.kind === 'video');
      
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        if (videoSender) {
          // 기존 sender가 있으면 트랙 교체
          console.log('Replacing video track with DeepAR track');
          videoSender.replaceTrack(videoTrack);
        } else {
          // 없으면 새로 추가
          console.log('Adding DeepAR video track to existing peer connection');
          pc.addTrack(videoTrack, stream);
        }
      }
    }
  }, []);

  return {
    status,
    sessionId,
    matchedUser,
    similarityScore,
    role,
    localStream,
    remoteStream,
    isConnected,
    isWsConnected,
    error,
    join,
    leave,
    endCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    clearError,
    setDeepARStream,
  };
}
