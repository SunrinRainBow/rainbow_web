import { apiFetch } from '@/utils/api';
import type { MatchingStatus, MatchingJoinResponse, MatchingLeaveResponse } from '../type';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';

export const getMatchingStatus = async (): Promise<MatchingStatus> => {
  const response = await apiFetch(`${API_BASE_URL}/matching/status`);
  
  if (!response.ok) {
    throw new Error('매칭 상태 조회에 실패했습니다.');
  }
  
  return response.json();
};

export const joinMatchingQueue = async (): Promise<MatchingJoinResponse> => {
  const response = await apiFetch(`${API_BASE_URL}/matching/join`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('매칭 참가에 실패했습니다.');
  }
  
  return response.json();
};

export const leaveMatchingQueue = async (): Promise<MatchingLeaveResponse> => {
  const response = await apiFetch(`${API_BASE_URL}/matching/leave`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('매칭 취소에 실패했습니다.');
  }
  
  return response.json();
};

export const endMatchingSession = async (sessionId: number): Promise<{ status: string; message: string }> => {
  const response = await apiFetch(`${API_BASE_URL}/matching/end/${sessionId}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('세션 종료에 실패했습니다.');
  }
  
  return response.json();
};

