import { apiFetch } from '@/utils/api';
import type { PreferencesData } from '../type';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';

export const getMyPreferences = async (): Promise<PreferencesData> => {
  const response = await apiFetch(`${API_BASE_URL}/preferences/me`);
  
  if (!response.ok) {
    throw new Error('선호도 조회에 실패했습니다.');
  }
  
  return response.json();
};

export const updateMyPreferences = async (data: PreferencesData): Promise<PreferencesData> => {
  const response = await apiFetch(`${API_BASE_URL}/preferences/me`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('선호도 수정에 실패했습니다.');
  }
  
  return response.json();
};


