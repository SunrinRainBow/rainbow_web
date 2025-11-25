import styles from "./styles.module.scss";
import GradientText from "@/components/react-bits/gradientText";
import Start from "@/components/page/home/start";

export default function Section1() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        
        <div className={styles.hero_section}>
          <div className={styles.hero_content}>
            <h1 className={styles.hero_title}>
              취향이 통하는 사람들과
              <br />
              <GradientText
                colors={["#00F69D", "#4079FF", "#00F69D", "#4079FF"]}
                animationSpeed={3}
                showBorder={false}
              >
                진짜 대화를 시작하세요
              </GradientText>
            </h1>
            <p className={styles.hero_description}>
              레인보우는 당신의 취향 코드를 분석해
              <br />
              대화 코드가 맞는 사람과 연결해드립니다.
              <br />
              외모 부담 없이, 대화에만 집중하세요.
            </p>
            <div className={styles.hero_button}>
              <Start />
            </div>
          </div>
        </div>

        <div className={styles.preview_section}>
          <div className={styles.video_preview}>
            
            <div className={styles.video_container}>
              <div className={styles.video_placeholder}>
                
                <div className={styles.animated_background}></div>

                <div className={styles.video_overlay}>
                  <div className={styles.central_content}>
                    <div className={styles.play_button}>
                      <svg
                        width="70"
                        height="70"
                        viewBox="0 0 70 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="35"
                          cy="35"
                          r="35"
                          fill="rgba(255, 255, 255, 0.95)"
                        />
                        <path d="M28 22L48 35L28 48V22Z" fill="#000" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={styles.live_badge}>
                  <span className={styles.live_dot}></span>
                  <span>LIVE</span>
                </div>

                <div className={styles.connecting_dots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
