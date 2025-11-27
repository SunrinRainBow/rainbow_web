import styles from "./styles.module.scss";

export interface CategoryItemProps {
  id: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function CategoryItem({
  label,
  description,
  icon,
  isSelected = false,
  onClick,
}: CategoryItemProps) {
  return (
    <div
      className={`${styles.container} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
    >
      <div className={styles.content}>
        <div className={styles.title}>{label}</div>
        <div className={styles.description}>{description}</div>
      </div>
      {icon && <div className={styles.icon}>{icon}</div>}
      {isSelected && (
        <div className={styles.checkmark}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="10" fill="#00f69d" />
            <path
              d="M6 10L9 13L14 7"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
