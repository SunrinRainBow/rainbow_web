import { apiFetch } from '@/utils/api';
import type { User, ProfileData } from '../type';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';

export const getMyProfile = async (): Promise<User> => {
  const response = await apiFetch(`${API_BASE_URL}/profile/me`);
  
  if (!response.ok) {
    throw new Error('프로필 조회에 실패했습니다.');
  }
  
  return response.json();
};

export const updateMyProfile = async (data: ProfileData): Promise<User> => {
  const response = await apiFetch(`${API_BASE_URL}/profile/me`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('프로필 수정에 실패했습니다.');
  }
  
  return response.json();
};

