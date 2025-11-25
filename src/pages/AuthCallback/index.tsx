import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { isLoading } = useAuth();

  useEffect(() => {
    // AuthContext에서 콜백 처리가 완료되면 자동으로 리다이렉트됩니다
    // 여기서는 로딩 상태만 표시
    if (!isLoading) {
      // 처리 완료 후 홈으로 이동 (AuthContext에서 이미 처리됨)
      navigate('/');
    }
  }, [isLoading, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div>로그인 처리 중...</div>
    </div>
  );
}


