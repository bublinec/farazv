import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import styles from "@/components/feedback/Feedback.module.css";

export const metadata: Metadata = {
  title: "Podnety a nápady",
  description:
    "Pomôžte nám zlepšovať život farnosti aj tento web. Napíšte nám svoj podnet alebo nápad.",
  alternates: { canonical: "/podnety" }
};

export default async function FeedbackPage({
  searchParams
}: {
  searchParams: Promise<{ tema?: string }>;
}) {
  const { tema } = await searchParams;
  return (
    <section className={styles.page}>
      <div className={`container ${styles.inner}`}>
        <header className={styles.heading}>
          <h1>Podnety a nápady</h1>
          <p>
            Pomôžte nám zlepšovať život farnosti aj tento web. Budeme radi za
            vašu spätnú väzbu a konkrétne nápady.
          </p>
        </header>
        <FeedbackForm
          initialTopic={
            tema === "web"
              ? "website"
              : tema === "farnost"
              ? "parish"
              : undefined
          }
        />
      </div>
    </section>
  );
}
