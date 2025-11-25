import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import MainLayout from "@/components/layout/main";
import Video from "@/components/page/home/video";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMatching } from "@/hooks/useMatching";
import { useWebRTC } from "@/hooks/useWebRTC";
import styles from "./styles.module.scss";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { 
    status: matchingStatus, 
    sessionId, 
    matchedUser, 
    similarityScore,
    error: matchingError,
    join, 
    leave, 
    endSession,
    clearError,
  } = useMatching();
  
  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
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

          <div className={styles.matching_controls}>
            {!isAuthenticated ? (
              <div className={styles.login_prompt}>
                로그인 후 매칭을 시작할 수 있습니다.
              </div>
            ) : matchingStatus === 'idle' ? (
              <Button variant="primary" size="large" onClick={handleStartMatching}>
                매칭 시작
              </Button>
            ) : matchingStatus === 'waiting' ? (
              <div className={styles.waiting_status}>
                <div className={styles.waiting_text}>매칭 대기 중...</div>
                <Button variant="secondary" size="medium" onClick={handleStopMatching}>
                  매칭 취소
                </Button>
              </div>
            ) : matchingStatus === 'matched' ? (
              <div className={styles.matched_status}>
                <div className={styles.matched_info}>
                  {matchedUser && (
                    <>
                      <span className={styles.matched_name}>
                        {matchedUser.nickname || matchedUser.name || '상대방'}
                      </span>
                      <span className={styles.similarity}>
                        유사도: {Math.round((similarityScore || 0) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                <Button variant="secondary" size="medium" onClick={handleEndCall}>
                  통화 종료
                </Button>
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
