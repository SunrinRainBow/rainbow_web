import type { AuthResponse } from '../type';
import { apiFetch } from '@/utils/api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088').replace(/\/$/, '');

export const startGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/auth/login/google`;
};

export const handleGoogleCallback = async (code: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/google/callback?code=${encodeURIComponent(code)}`);
  
  if (!response.ok) {
    throw new Error('Google 로그인에 실패했습니다.');
  }
  
  return response.json();
};

export const logout = async (): Promise<void> => {
  const response = await apiFetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('로그아웃에 실패했습니다.');
  }
};

