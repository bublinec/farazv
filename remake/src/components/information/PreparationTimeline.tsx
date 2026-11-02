import type { SacramentPreparation } from "@/content/sacrament-preparation";
import styles from "./PreparationTimeline.module.css";

export function PreparationTimeline({
  preparation
}: {
  preparation: SacramentPreparation;
}) {
  return (
    <section
      id="priprava"
      className={styles.timeline}
      aria-labelledby="priprava-heading"
    >
      <h2 id="priprava-heading">{preparation.title}</h2>
      <p className={styles.introduction}>{preparation.introduction}</p>
      <ol className={styles.steps} role="list">
        {preparation.steps.map((step, index) => (
          <li className={styles.step} key={step.title}>
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <span className={styles.when}>{step.when}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
      <a href="#informacie-2" className={styles.details}>
        Podrobné podmienky a ďalšie možnosti <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
