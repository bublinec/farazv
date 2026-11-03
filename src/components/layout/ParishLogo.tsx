import { siteConfig } from "@/content/site";
import { ChurchMark } from "./ChurchMark";
import styles from "./ParishLogo.module.css";

export function ParishLogo() {
  return (
    <span className={styles.logo}>
      <ChurchMark className={styles.mark} />
      <span>
        <strong>{siteConfig.name}</strong>
        <small>{siteConfig.city}</small>
      </span>
    </span>
  );
}
