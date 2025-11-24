import styles from "./styles.module.scss";

export default function GoogleButton() {
  return (
    <div className={styles.container}>
      <img src="/public\Google_Logo.svg" alt="google-button" />
      <span>Google로 로그인</span>
    </div>
  );
}
