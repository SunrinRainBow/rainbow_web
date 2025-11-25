import Loading from "./loading";
import OnlyVoice from "./only-voice";
import Camera from "./camera";
import DeepARCamera from "./deepar-camera";
import Default from "./defualt";
import styles from "./styles.module.scss";

export type VideoMode = "loading" | "only-voice" | "camera" | "deepar" | "default";

interface VideoProps {
  mode?: VideoMode;
  remoteStream?: MediaStream | null;
  localStream?: MediaStream | null;
  showControls?: boolean;
  onVideoToggle?: () => void;
  isVideoOn?: boolean;
}

export default function Video({
  mode = "loading",
  remoteStream = null,
  localStream = null,
  showControls = false,
  onVideoToggle,
  isVideoOn = true,
}: VideoProps) {
  return (
    <div className={styles.container}>
      {mode === "loading" && <Loading />}
      {mode === "only-voice" && (
        <OnlyVoice
          showControls={showControls}
          onVideoToggle={onVideoToggle}
          isVideoOn={isVideoOn}
        />
      )}
      {mode === "camera" && (
        <Camera
          showControls={showControls}
          onVideoToggle={onVideoToggle}
          isVideoOn={isVideoOn}
          localStream={localStream}
        />
      )}
      {mode === "deepar" && (
        <DeepARCamera
          showControls={showControls}
          onVideoToggle={onVideoToggle}
          isVideoOn={isVideoOn}
        />
      )}
      {mode === "default" && <Default remoteStream={remoteStream} />}
    </div>
  );
}
