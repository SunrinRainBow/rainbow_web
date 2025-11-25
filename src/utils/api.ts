/**
 * API 요청 시 JWT 토큰을 자동으로 포함하는 fetch 래퍼
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};


