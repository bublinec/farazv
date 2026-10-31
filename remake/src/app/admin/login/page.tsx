import type { Metadata } from "next";
import Link from "next/link";
import { isAuthConfigured } from "@/server/auth";
import { GoogleSignIn } from "./GoogleSignIn";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Prihlásenie do administrácie",
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
        <span className={styles.mark} aria-hidden="true">
          ✦
        </span>
        <p className="eyebrow">Farnosť Zvolen</p>
        <h1>Priestor pre editorov</h1>
        <p className={styles.description}>
          Farské oznamy, články a všetko, čím žije naše spoločenstvo, na jednom
          mieste.
        </p>
        {error && (
          <p className={styles.notice} role="alert">
            Prihlásenie sa nepodarilo alebo tento účet nemá povolený prístup.
            Použite svoj schválený Google účet.
          </p>
        )}
        {configured ? (
          <GoogleSignIn />
        ) : (
          <p className={styles.notice} role="status">
            Prihlásenie ešte nie je nastavené. Správca stránky musí dokončiť
            nastavenie Google účtu a prístupov.
          </p>
        )}
        <p className={styles.hint}>
          Prístup majú iba vopred schválení redaktori. Nový účet sa tu nedá
          zaregistrovať.
        </p>
        <Link href="/" className={styles.back}>
          ← Späť na farskú stránku
        </Link>
      </div>
    </section>
  );
}
