import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import MainLayout from "@/components/layout/main";
import Video from "@/components/page/home/video";
import { useAuth } from "@/contexts/AuthContext";
import { useRoom } from "@/hooks/useRoom";
import { Video as VideoIcon } from "lucide-react";
import styles from "./styles.module.scss";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const {
    status,
    matchedUser,
    role,
    localStream,
    remoteStream,
    isConnected,
    isWsConnected,
    error,
    join,
    leave,
    endCall,
    isVideoEnabled,
    isRemoteVideoEnabled,
    clearError,
    setDeepARStream,
  } = useRoom();

  const [isVideoOn, setIsVideoOn] = useState(true);

  const handleStartMatching = async () => {
    clearError();
    try {
      await join();
    } catch (err) {
      console.error("Failed to start matching:", err);
    }
  };

  const handleStopMatching = async () => {
    try {
      await leave();
    } catch (err) {
      console.error("Failed to stop matching:", err);
    }
  };

  const handleEndCall = () => {
    endCall();
  };

  useEffect(() => {
    setIsVideoOn(isVideoEnabled);
  }, [isVideoEnabled]);

  const getStatusText = () => {
    switch (status) {
      case "waiting":
        return "매칭 중... 취소하려면 탭하세요";
      case "matched":
        return isConnected ? "연결됨" : "연결 중...";
      case "connected":
        return "통화 중";
      default:
        return "";
    }
  };

  return (
    <>
      <Header />
      <MainLayout>
        <div className={styles.container}>
          {error && (
            <div className={styles.error_message}>
              <span>{error}</span>
              <button className={styles.error_close} onClick={clearError}>
                ×
              </button>
            </div>
          )}

          <div className={styles.bottom_controls}>
            {!isAuthenticated ? (
              <div className={styles.login_prompt}>
                로그인 후 매칭을 시작할 수 있습니다.
              </div>
            ) : !isWsConnected ? (
              <div className={styles.connecting_prompt}>
                <div className={styles.waiting_spinner}></div>
                <span>서버 연결 중...</span>
              </div>
            ) : status === "idle" ? (
              <button
                className={styles.start_button}
                onClick={handleStartMatching}
              >
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
            ) : status === "waiting" ? (
              <button
                className={styles.waiting_button}
                onClick={handleStopMatching}
              >
                <div className={styles.waiting_spinner}></div>
                <span>{getStatusText()}</span>
              </button>
            ) : status === "matched" || status === "connected" ? (
              <div className={styles.matched_controls}>
                <div className={styles.matched_info}>
                  {matchedUser && (
                    <span className={styles.matched_name}>
                      {matchedUser.nickname || matchedUser.name || "상대방"}과{" "}
                      {isConnected ? "통화 중" : "연결 중..."}
                    </span>
                  )}
                  {role && (
                    <span className={styles.role_badge}>
                      {role === "initiator" ? "호스트" : "게스트"}
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
                  isVideoOn={isVideoOn}
                  localStream={localStream}
                  onStreamReady={setDeepARStream}
                />
                <div className={styles.video_label}>나</div>
              </div>
            </div>

            <div className={styles.remote_section}>
              <div className={styles.video_wrapper}>
                <Video
                  mode={
                    (status === "matched" || status === "connected") &&
                    remoteStream
                      ? "default"
                      : status === "waiting"
                      ? "loading"
                      : "idle"
                  }
                  remoteStream={remoteStream}
                  isRemoteVideoEnabled={isRemoteVideoEnabled}
                  matchedUserName={matchedUser?.nickname || matchedUser?.name}
                />
                <div className={styles.video_label}>
                  {matchedUser?.nickname || matchedUser?.name || "상대방"}
                </div>
              </div>
            </div>
          </div>

          {(status === "matched" || status === "connected") && !isConnected && (
            <div className={styles.connection_status}>WebRTC 연결 중...</div>
          )}
        </div>
      </MainLayout>
    </>
  );
}
