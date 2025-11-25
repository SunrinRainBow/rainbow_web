import { Sparkles, Filter, Heart } from "lucide-react";
import styles from "./styles.module.scss";

export default function Section2() {
  return (
    <div className={styles.content_section}>
      <div className={styles.content_wrapper}>
        <h2 className={styles.content_title}>
          레인보우 - 취향이 통하는 사람들과 만나요
        </h2>
        <p className={styles.content_subtitle}>
          랜덤채팅 대신, 대화 코드가 맞는 진짜 친구를 만나보세요.
        </p>
        <p className={styles.content_description}>
          레인보우는 다양한 취향과 성격을 가진 사람들이 모이는 공간입니다.
          <br />
          당신의 취향 코드를 분석해 대화 코드가 잘 맞는 사람끼리 화상채팅으로
          연결해드립니다.
          <br />
          외모 부담 없이, 대화에만 집중할 수 있는 편안한 만남의 장을 제공합니다.
        </p>

        <div className={styles.features_grid}>
          
          <div className={styles.feature_card}>
            <div className={styles.feature_header}>
              <Sparkles className={styles.feature_icon} />
              <h3 className={styles.feature_title}>취향 기반 매칭</h3>
            </div>
            <p className={styles.feature_description}>
              단순 성별/지역 필터가 아닌, 당신이 입력한 데이터와 상호작용
              데이터를 분석하여 취향이 맞는 사람과 매칭해드립니다. 시스템이 계속
              학습하여 더 정확한 매칭을 제공합니다.
            </p>
          </div>

          <div className={styles.feature_card}>
            <div className={styles.feature_header}>
              <Filter className={styles.feature_icon} />
              <h3 className={styles.feature_title}>얼굴 필터 기능</h3>
            </div>
            <p className={styles.feature_description}>
              얼굴 노출에 부담을 느끼는 사용자를 위해 다양한 필터 기능을
              제공합니다. 익명성과 편안함을 보장하면서도 재미있는 요소를 더해
              부담 없이 대화를 시작할 수 있습니다.
            </p>
          </div>

          <div className={styles.feature_card}>
            <div className={styles.feature_header}>
              <Heart className={styles.feature_icon} />
              <h3 className={styles.feature_title}>대화 중심의 만남</h3>
            </div>
            <p className={styles.feature_description}>
              불필요한 외모 부담을 제거하고 대화 코드에 집중합니다. 취향이 맞지
              않는 상대는 스킵할 수 있으며, 이러한 데이터를 학습하여 점점 더
              정확한 취향 매칭을 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
