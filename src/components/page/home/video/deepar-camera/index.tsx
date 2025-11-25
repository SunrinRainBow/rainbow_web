import { useRef, useEffect, useState } from "react";
import { Video, Smile } from "lucide-react";
import { useDeepAR, DEEPAR_EFFECTS } from "@/hooks/useDeepAR";
import FilterModal from "../filter-modal";
import styles from "../camera/styles.module.scss";

interface DeepARCameraProps {
  showControls?: boolean;
  onVideoToggle?: () => void;
  isVideoOn?: boolean;
}

export default function DeepARCamera({
  showControls = false,
  onVideoToggle,
}: DeepARCameraProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const {
    isInitialized,
    isLoading,
    currentEffect,
    error,
    initialize,
    switchEffect,
    clearEffect,
  } = useDeepAR();

  useEffect(() => {
    if (previewRef.current && !isInitialized && !isLoading) {
      initialize(previewRef.current);
    }
  }, [isInitialized, isLoading, initialize]);

  const handleVideoToggle = () => {
    onVideoToggle?.();
  };

  const handleFilterSelect = async (effectPath: string | null) => {
    if (effectPath) {
      await switchEffect(effectPath);
    } else {
      await clearEffect();
    }
  };

  return (
    <div className={styles.container}>
      
      <div 
        ref={previewRef} 
        className={styles.deepar_preview}
        style={{ width: '100%', height: '100%' }}
      />

      {!isInitialized && (
        <div className={styles.placeholder}>
          <div className={styles.placeholder_content}>
            {isLoading ? (
              <>
                <div className={styles.connecting_animation}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className={styles.placeholder_text}>카메라 로딩 중...</p>
              </>
            ) : error ? (
              <p className={styles.placeholder_text}>{error}</p>
            ) : (
              <p className={styles.placeholder_text}>카메라 준비 중...</p>
            )}
          </div>
        </div>
      )}

      {currentEffect && (
        <div className={styles.filter_indicator}>
          {DEEPAR_EFFECTS.style.find(f => f.id === currentEffect)?.preview || 
           DEEPAR_EFFECTS.beauty.find(f => f.id === currentEffect)?.preview || '✨'}
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
          <button
            className={styles.control_button}
            onClick={handleVideoToggle}
            aria-label="카메라 끄기"
          >
            <Video size={20} />
          </button>
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilterSelect={handleFilterSelect}

        externalDeepAR={{
          isInitialized,
          currentEffect,
          switchEffect,
          clearEffect,
        }}
      />
    </div>
  );
}

