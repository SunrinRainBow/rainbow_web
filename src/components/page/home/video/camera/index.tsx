import { useRef, useEffect, useState } from "react";
import { Smile } from "lucide-react";
import FilterModal from "../filter-modal";
import styles from "./styles.module.scss";

interface CameraProps {
  showControls?: boolean;
  isVideoOn?: boolean;
  localStream?: MediaStream | null;
}

export default function Camera({
  showControls = false,
  isVideoOn = true,
  localStream,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    if (localStream) {
      setStream(localStream);
      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
      }
      return;
    }

    const getCameraStream = async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: true,
        });
        setStream(cameraStream);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch (error) {
        console.error("카메라 접근 실패:", error);
      }
    };

    if (isVideoOn) {
      getCameraStream();
    } else {
      if (stream && !localStream) {
        stream.getVideoTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream && !localStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn, localStream]);

  return (
    <div className={styles.container}>
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay
        muted
        playsInline
      />
      {!stream && (
        <div className={styles.placeholder}>
          <div className={styles.placeholder_content}>
            <div className={styles.connecting_animation}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className={styles.placeholder_text}>카메라 로딩 중...</p>
          </div>
        </div>
      )}
      {showControls && (
        <div className={styles.controls}>
          <button
            className={styles.control_button}
            onClick={() => setIsFilterModalOpen(true)}
            aria-label="필터"
          >
            <Smile size={20} />
          </button>
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilterSelect={(effect) => {
          console.log("선택된 필터:", effect);
        }}
      />
    </div>
  );
}
