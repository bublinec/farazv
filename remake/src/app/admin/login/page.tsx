import type { Metadata } from "next";
import { isAuthConfigured } from "@/server/auth";
import { GoogleSignIn } from "./GoogleSignIn";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Prihlásenie",
  robots: { index: false, follow: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = isAuthConfigured();
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <p className={styles.parish}>Farnosť Zvolen-mesto</p>
        <h1>Admin</h1>
        {error && (
          <p className={styles.notice} role="alert">
            Prihlásenie sa nepodarilo. Použite účet s povoleným prístupom.
          </p>
        )}
        {configured ? (
          <GoogleSignIn />
        ) : (
          <p className={styles.notice} role="status">
            Prihlásenie cez Google ešte nie je nastavené.
          </p>
        )}
      </div>
    </section>
  );
}
