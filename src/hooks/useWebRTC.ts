import { useState, useEffect, useCallback, useRef } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8088';

// STUN/TURN 서버 설정
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

  // 로컬 미디어 스트림 획득
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

  // PeerConnection 생성
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // ICE candidate 이벤트
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          data: event.candidate,
        }));
      }
    };

    // 연결 상태 변경
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
        setIsConnecting(false);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    // 원격 트랙 수신
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // 로컬 트랙 추가
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  // WebSocket 연결 및 시그널링
  const connectSignaling = useCallback(() => {
    if (!sessionId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/signal/${sessionId}/?token=${token}`);

    ws.onopen = async () => {
      // PeerConnection 생성 후 offer 전송
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
          // Offer 수신 (상대방이 먼저 연결한 경우)
          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({
            type: 'answer',
            data: answer,
          }));
          break;

        case 'answer':
          // Answer 수신
          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
          break;

        case 'ice-candidate':
          // ICE candidate 수신
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

  // 통화 시작
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

  // 통화 종료
  const endCall = useCallback(() => {
    // 로컬 스트림 정지
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // PeerConnection 종료
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // WebSocket 종료
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // 비디오 토글
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // 오디오 토글
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  // sessionId 변경 시 연결
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

