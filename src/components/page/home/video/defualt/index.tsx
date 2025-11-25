import { useRef, useEffect } from "react";
import styles from "./styles.module.scss";

interface DefaultProps {
  remoteStream?: MediaStream | null;
}

export default function Default({ remoteStream }: DefaultProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
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
