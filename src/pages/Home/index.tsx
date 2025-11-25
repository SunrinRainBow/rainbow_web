import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import MainLayout from "@/components/layout/main";
import Video from "@/components/page/home/video";
import { useAuth } from "@/contexts/AuthContext";
import { useMatching } from "@/hooks/useMatching";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Video as VideoIcon } from "lucide-react";
import styles from "./styles.module.scss";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { 
    status: matchingStatus, 
    sessionId, 
    matchedUser, 
    error: matchingError,
    join, 
    leave, 
    endSession,
    clearError,
  } = useMatching();
  
  const {
    localStream,
    remoteStream,
    isConnecting,
    toggleVideo,
    isVideoEnabled,
    endCall,
  } = useWebRTC(sessionId);

  const [isVideoOn, setIsVideoOn] = useState(true);

  const handleVideoToggle = () => {
    toggleVideo();
    setIsVideoOn((prev) => !prev);
  };

  const handleStartMatching = async () => {
    clearError();
    try {
      await join();
    } catch (error) {
      console.error('Failed to start matching:', error);
    }
  };

  const handleStopMatching = async () => {
    try {
      await leave();
    } catch (error) {
      console.error('Failed to stop matching:', error);
    }
  };

  const handleEndCall = async () => {
    endCall();
    await endSession();
  };

  useEffect(() => {
    setIsVideoOn(isVideoEnabled);
  }, [isVideoEnabled]);

  return (
    <>
      <Header />
      <MainLayout>
        <div className={styles.container}>
          
          {matchingError && (
            <div className={styles.error_message}>
              <span>{matchingError}</span>
              <button className={styles.error_close} onClick={clearError}>×</button>
            </div>
          )}

          <div className={styles.bottom_controls}>
            {!isAuthenticated ? (
              <div className={styles.login_prompt}>
                로그인 후 매칭을 시작할 수 있습니다.
              </div>
            ) : matchingStatus === 'idle' ? (
              <button className={styles.start_button} onClick={handleStartMatching}>
                <VideoIcon size={20} />
                <div className={styles.avatar_stack}>
                  <img src="https://i.pravatar.cc/40?img=1" alt="" />
                  <img src="https://i.pravatar.cc/40?img=2" alt="" />
                  <img src="https://i.pravatar.cc/40?img=3" alt="" />
                  <img src="https://i.pravatar.cc/40?img=4" alt="" />
                  <img src="https://i.pravatar.cc/40?img=5" alt="" />
                </div>
                <span>비디오챗 시작하기</span>
              </button>
            ) : matchingStatus === 'waiting' ? (
              <button className={styles.waiting_button} onClick={handleStopMatching}>
                <div className={styles.waiting_spinner}></div>
                <span>매칭 중... 취소하려면 탭하세요</span>
              </button>
            ) : matchingStatus === 'matched' ? (
              <div className={styles.matched_controls}>
                <div className={styles.matched_info}>
                  {matchedUser && (
                    <span className={styles.matched_name}>
                      {matchedUser.nickname || matchedUser.name || '상대방'}과 연결됨
                    </span>
                  )}
                </div>
                <button className={styles.end_button} onClick={handleEndCall}>
                  통화 종료
                </button>
              </div>
            ) : null}
          </div>

          <div className={styles.video_grid}>
            
            <div className={styles.local_section}>
              <div className={styles.video_wrapper}>
                <Video
                  mode={isVideoOn ? "deepar" : "only-voice"}
                  showControls={true}
                  onVideoToggle={handleVideoToggle}
                  isVideoOn={isVideoOn}
                  localStream={localStream}
                />
                <div className={styles.video_label}>나</div>
              </div>
            </div>

            <div className={styles.remote_section}>
              <div className={styles.video_wrapper}>
                <Video 
                  mode={matchingStatus === 'matched' && remoteStream ? "default" : "loading"} 
                  remoteStream={remoteStream} 
                />
                <div className={styles.video_label}>
                  {matchedUser?.nickname || matchedUser?.name || '상대방'}
                </div>
              </div>
            </div>
          </div>

          {isConnecting && (
            <div className={styles.connection_status}>
              연결 중...
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}
