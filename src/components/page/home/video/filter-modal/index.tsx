import { useRef, useEffect } from "react";
import { X, Camera } from "lucide-react";
import { DEEPAR_EFFECTS } from "@/hooks/useDeepAR";
import styles from "./styles.module.scss";

interface ExternalDeepAR {
  isInitialized: boolean;
  currentEffect: string | null;
  switchEffect: (effectPath: string) => Promise<void>;
  clearEffect: () => Promise<void>;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterSelect?: (effectPath: string | null) => void;
  externalDeepAR?: ExternalDeepAR;
  previewElement?: HTMLDivElement | null;
}

export default function FilterModal({ 
  isOpen, 
  onClose, 
  onFilterSelect,
  externalDeepAR,
  previewElement,
}: FilterModalProps) {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const originalParentRef = useRef<HTMLElement | null>(null);

  const isInitialized = externalDeepAR?.isInitialized ?? false;
  const currentEffect = externalDeepAR?.currentEffect ?? null;
  const isLoading = false;

  useEffect(() => {
    if (isOpen && previewElement && previewContainerRef.current) {
      originalParentRef.current = previewElement.parentElement;
      previewContainerRef.current.appendChild(previewElement);
      previewElement.style.borderRadius = '16px';
    }

    return () => {
      if (previewElement && originalParentRef.current) {
        originalParentRef.current.appendChild(previewElement);
        previewElement.style.borderRadius = '';
      }
    };
  }, [isOpen, previewElement]);

  const handleFilterSelect = async (effectPath: string) => {
    if (externalDeepAR) {
      await externalDeepAR.switchEffect(effectPath);
    }
    onFilterSelect?.(effectPath);
  };

  const handleClearEffect = async () => {
    if (externalDeepAR) {
      await externalDeepAR.clearEffect();
    }
    onFilterSelect?.(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>이펙트</h2>
          <button className={styles.close_button} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.preview}>
          <div className={styles.preview_video} ref={previewContainerRef}>
            {!previewElement && (
              <div className={styles.preview_placeholder}>
                <Camera size={48} color="rgba(255,255,255,0.3)" />
                <span>카메라 미리보기</span>
              </div>
            )}
          </div>
          {currentEffect && (
            <button 
              className={styles.remove_effect_btn} 
              onClick={handleClearEffect}
              disabled={isLoading}
            >
              이펙트 제거
            </button>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.section_title}>스타일</h3>
            <div className={styles.filter_grid}>
              {DEEPAR_EFFECTS.style.map((filter) => (
                <button
                  key={filter.id}
                  className={`${styles.filter_item} ${currentEffect === filter.id ? styles.selected : ''}`}
                  onClick={() => handleFilterSelect(filter.path)}
                  disabled={isLoading || !isInitialized}
                  title={filter.name}
                >
                  <div className={styles.filter_icon}>{filter.preview}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.section_title}>뷰티</h3>
            <div className={styles.filter_grid}>
              {DEEPAR_EFFECTS.beauty.map((filter) => (
                <button
                  key={filter.id}
                  className={`${styles.filter_item} ${currentEffect === filter.id ? styles.selected : ''}`}
                  onClick={() => handleFilterSelect(filter.path)}
                  disabled={isLoading || !isInitialized}
                  title={filter.name}
                >
                  <div className={styles.filter_icon}>{filter.preview}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

