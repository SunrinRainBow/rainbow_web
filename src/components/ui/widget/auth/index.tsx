import { X } from "lucide-react";
import styles from "./styles.module.scss";
import GoogleButton from "./google-button";

interface AuthProps {
  onClose?: () => void;
}

export default function Auth({ onClose }: AuthProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.container}>
        <div className={styles.header}>
          <X className={styles.close} onClick={onClose} />
        </div>
        <div className={styles.content}>
          <div className={styles.logo}>Logo</div>
          <div className={styles.title}>0</div>
          <div className={styles.description}>건의 매칭이 진행중이에요</div>
          <div className={styles.form}>
            <GoogleButton />
          </div>
        </div>
        <div className={styles.footer}>
          <a href="#" className={styles.contact}>
            문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
