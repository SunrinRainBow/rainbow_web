import type { AuthResponse } from '../type';
import { apiFetch } from '@/utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';

/**
 * Google 로그인 시작
 * Google OAuth 인증 페이지로 리다이렉트합니다.
 */
export const startGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/auth/login/google`;
};

/**
 * Google OAuth 콜백 처리
 * URL에서 code 파라미터를 추출하여 서버에 전송하고 사용자 정보를 받아옵니다.
 */
export const handleGoogleCallback = async (code: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/google/callback?code=${encodeURIComponent(code)}`);
  
  if (!response.ok) {
    throw new Error('Google 로그인에 실패했습니다.');
  }
  
  return response.json();
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  const response = await apiFetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('로그아웃에 실패했습니다.');
  }
};

