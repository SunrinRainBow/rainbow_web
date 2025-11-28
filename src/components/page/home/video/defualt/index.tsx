import { useRef, useEffect } from "react";
import styles from "./styles.module.scss";

interface DefaultProps {
  remoteStream?: MediaStream | null;
}

export default function Default({ remoteStream }: DefaultProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && remoteStream) {
      console.log('🎥 Setting remote stream to video element');
      console.log('Remote stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      video.srcObject = remoteStream;
      
      // 명시적으로 재생 시도
      video.play().then(() => {
        console.log('✅ Remote video playing');
      }).catch((err) => {
        console.error('❌ Failed to play remote video:', err);
        // 사용자 상호작용 후 재생 시도
        video.muted = true;
        video.play().then(() => {
          console.log('✅ Remote video playing (muted)');
          // 0.5초 후 음소거 해제
          setTimeout(() => {
            video.muted = false;
          }, 500);
        }).catch(console.error);
      });
    }
  }, [remoteStream]);

  const mockData = {
    avatar: "/Avatar.svg",
    name: "상대방",
  };

  return (
    <div className={styles.container}>
      {remoteStream ? (
        <video ref={videoRef} className={styles.video} autoPlay playsInline />
      ) : (
        <div className={styles.placeholder}>
          <div className={styles.placeholder_content}>
            <div className={styles.avatar_wrapper}>
              <img
                src={mockData.avatar}
                alt={mockData.name}
                className={styles.avatar}
              />
            </div>
            <h3 className={styles.name}>{mockData.name}</h3>
            <div className={styles.connecting_animation}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className={styles.placeholder_text}>상대방 연결 대기 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
