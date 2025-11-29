import { Video } from "lucide-react";
import styles from "./styles.module.scss";

interface LoadingProps {
  isIdle?: boolean;
}

export default function Loading({ isIdle = false }: LoadingProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {isIdle ? (
          <>
            <div className={styles.idle_icon}>
              <Video size={48} />
            </div>
            <h2 className={styles.title}>새로운 친구를 만나보세요!</h2>
            <p className={styles.description}>아래 버튼을 눌러 매칭을 시작하세요</p>
          </>
        ) : (
          <>
            <div className={styles.connecting_animation}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <h2 className={styles.title}>매칭 중...</h2>
            <p className={styles.description}>취향이 맞는 사람을 찾고 있습니다</p>
          </>
        )}
      </div>
    </div>
  );
}
