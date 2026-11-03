import type { SacramentPreparation } from "@/content/sacrament-preparation";
import styles from "./PreparationTimeline.module.css";

export function PreparationTimeline({
  preparation
}: {
  preparation: SacramentPreparation;
}) {
  return (
    <aside
      id="priprava"
      className={styles.timeline}
      aria-labelledby="priprava-heading"
    >
      <h2 id="priprava-heading">{preparation.title}</h2>
      <ol className={styles.steps} role="list">
        {preparation.steps.map((step) => (
          <li className={styles.step} key={step.title}>
            <span className={styles.when}>{step.when}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
