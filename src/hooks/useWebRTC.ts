import { useState, useEffect, useCallback, useRef } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8088';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export function useWebRTC(sessionId: number | null): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Failed to get local stream:', error);
      throw error;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          data: event.candidate,
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
        setIsConnecting(false);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  const connectSignaling = useCallback(() => {
    if (!sessionId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/signal/${sessionId}/?token=${token}`);

    ws.onopen = async () => {

      const pc = createPeerConnection();
      
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        ws.send(JSON.stringify({
          type: 'offer',
          data: offer,
        }));
      } catch (error) {
        console.error('Failed to create offer:', error);
      }
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      const pc = peerConnectionRef.current;

      if (!pc) return;

      switch (message.type) {
        case 'offer':

          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({
            type: 'answer',
            data: answer,
          }));
          break;

        case 'answer':

          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
          break;

        case 'ice-candidate':

          if (message.data) {
            await pc.addIceCandidate(new RTCIceCandidate(message.data));
          }
          break;

        case 'peer-connected':
          console.log('Peer connected:', message.user_id);
          break;

        case 'peer-disconnected':
          console.log('Peer disconnected:', message.user_id);
          setRemoteStream(null);
          setIsConnected(false);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Signaling WebSocket closed');
    };

    ws.onerror = (error) => {
      console.error('Signaling WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [sessionId, createPeerConnection]);

  const startCall = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      await getLocalStream();
      connectSignaling();
    } catch (error) {
      setIsConnecting(false);
      throw error;
    }
  }, [getLocalStream, connectSignaling]);

  const endCall = useCallback(() => {

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

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

  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  useEffect(() => {
    if (sessionId && !isConnected && !isConnecting) {
      startCall();
    }
  }, [sessionId, isConnected, isConnecting, startCall]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
  };
}

