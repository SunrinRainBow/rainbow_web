import { useState } from "react";
import Header from "@/components/layout/header";
import MainLayout from "@/components/layout/main";
import Video from "@/components/page/home/video";
import styles from "./styles.module.scss";

export default function Home() {
  const [remoteStream, _setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const handleVideoToggle = () => {
    setIsVideoOn((prev) => !prev);
  };

  // TODO: WebRTC 연결 후 remoteStream 설정
  // 예: _setRemoteStream(stream);

  return (
    <>
      <Header />
      <MainLayout>
        <div className={styles.container}>
          <div className={styles.video_grid}>
            {/* 왼쪽: 본인 화면 */}
            <div className={styles.local_section}>
              <div className={styles.video_wrapper}>
                <Video
                  mode={isVideoOn ? "camera" : "only-voice"}
                  showControls={true}
                  onVideoToggle={handleVideoToggle}
                  isVideoOn={isVideoOn}
                />
                <div className={styles.video_label}>나</div>
              </div>
            </div>

            {/* 오른쪽: 상대방 화면 */}
            <div className={styles.remote_section}>
              <div className={styles.video_wrapper}>
                <Video mode="default" remoteStream={remoteStream} />
                <div className={styles.video_label}>상대방</div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
