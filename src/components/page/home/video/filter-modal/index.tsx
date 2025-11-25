import { X } from "lucide-react";
import styles from "./styles.module.scss";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

// 스타일 필터 데이터
const styleFilters = [
  { id: "style1", name: "스마일", emoji: "😊" },
  { id: "style2", name: "빅아이", emoji: "👀" },
  { id: "style3", name: "슬림", emoji: "😏" },
  { id: "style4", name: "스마일2", emoji: "😄" },
  { id: "style5", name: "내추럴", emoji: "🙂" },
  { id: "style6", name: "곰돌이", emoji: "🐻" },
  { id: "style7", name: "안경", emoji: "👓" },
  { id: "style8", name: "고양이", emoji: "🐱" },
  { id: "style9", name: "얼룩말", emoji: "🦓" },
  { id: "style10", name: "입술", emoji: "👄" },
  { id: "style11", name: "혀", emoji: "😛" },
  { id: "style12", name: "발", emoji: "🦶" },
  { id: "style13", name: "레오파드", emoji: "🐆" },
  { id: "style14", name: "이모지", emoji: "🤩" },
  { id: "style15", name: "하트", emoji: "❤️" },
  { id: "style16", name: "별", emoji: "⭐" },
  { id: "style17", name: "토끼", emoji: "🐰" },
  { id: "style18", name: "선글라스", emoji: "😎" },
];

// 뷰티 필터 데이터
const beautyFilters = [
  { id: "beauty1", name: "스무스", icon: "✨" },
  { id: "beauty2", name: "브라이트", icon: "☀️" },
  { id: "beauty3", name: "블러쉬", icon: "🌸" },
  { id: "beauty4", name: "립틴트", icon: "💋" },
  { id: "beauty5", name: "아이라인", icon: "👁️" },
];

export default function FilterModal({ isOpen, onClose, videoRef }: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.title}>이펙트</h2>
          <button className={styles.close_button} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* 비디오 프리뷰 */}
        <div className={styles.preview}>
          <div className={styles.preview_video}>
            <video autoPlay muted playsInline className={styles.video} />
            <div className={styles.preview_placeholder}>
              <span>프리뷰</span>
            </div>
          </div>
          <button className={styles.remove_effect}>이펙트 제거</button>
        </div>

        {/* 스타일 섹션 */}
        <div className={styles.section}>
          <h3 className={styles.section_title}>스타일</h3>
          <div className={styles.filter_grid}>
            {styleFilters.map((filter) => (
              <button key={filter.id} className={styles.filter_item}>
                <div className={styles.filter_icon}>{filter.emoji}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 뷰티 섹션 */}
        <div className={styles.section}>
          <h3 className={styles.section_title}>뷰티</h3>
          <div className={styles.filter_grid}>
            {beautyFilters.map((filter) => (
              <button key={filter.id} className={styles.filter_item}>
                <div className={styles.filter_icon}>{filter.icon}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

