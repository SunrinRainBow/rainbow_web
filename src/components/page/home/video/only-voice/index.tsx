import { useRef, useEffect, useState } from "react";
import { Smile, VideoOff } from "lucide-react";
import styles from "./styles.module.scss";

interface OnlyVoiceProps {
  showControls?: boolean;
  onVideoToggle?: () => void;
  isVideoOn?: boolean;
}

export default function OnlyVoice({
  showControls = false,
  onVideoToggle,
}: OnlyVoiceProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  useEffect(() => {

    const getAudioStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        setAudioStream(stream);
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("마이크 접근 실패:", error);
      }
    };

    getAudioStream();

    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon_wrapper}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="40" fill="rgba(0, 246, 157, 0.2)" />
            <path
              d="M40 20C35.5817 20 32 23.5817 32 28V40C32 44.4183 35.5817 48 40 48C44.4183 48 48 44.4183 48 40V28C48 23.5817 44.4183 20 40 20Z"
              fill="rgba(0, 246, 157, 0.8)"
            />
            <path
              d="M40 50C36.6863 50 34 52.6863 34 56V60H46V56C46 52.6863 43.3137 50 40 50Z"
              fill="rgba(0, 246, 157, 0.8)"
            />
            <path
              d="M28 40C28 45.5228 32.4772 50 38 50H42C47.5228 50 52 45.5228 52 40"
              stroke="rgba(0, 246, 157, 0.8)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className={styles.title}>음성 채팅 모드</h2>
        <p className={styles.description}>
          카메라가 꺼져 있습니다
          <br />
          음성으로만 대화하고 있습니다
        </p>
        <div className={styles.audio_indicator}>
          <div className={styles.wave}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      <audio ref={audioRef} autoPlay playsInline />
      {showControls && (
        <div className={styles.controls}>
          <button
            className={styles.control_button}
            onClick={() => {

            }}
            aria-label="필터"
          >
            <Smile size={20} />
          </button>
          <button
            className={styles.control_button}
            onClick={onVideoToggle}
            aria-label="카메라 켜기"
          >
            <VideoOff size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
