import type { Metadata } from "next";
import { isAuthConfigured } from "@/server/auth";
import { churchDetails } from "@/content/church-details";
import { MediaImage } from "@/components/ui/MediaImage";
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
        <div className={styles.photograph} aria-hidden="true">
          <MediaImage
            image={{ ...churchDetails.chapel, alt: "" }}
            sizes="(max-width: 640px) 100vw, 340px"
            priority
            quality="high"
          />
        </div>
        <div className={styles.form}>
          <h1>Admin</h1>
          <p className={styles.introduction}>
            Oznamy, výveska a život našej farnosti.
          </p>
          {error && (
            <p className={styles.notice} role="alert">
              Prihlásenie sa nepodarilo. Použite účet s povoleným prístupom.
            </p>
          )}
          {configured ? (
            <>
              <GoogleSignIn />
              <p className={styles.accessNote}>
                Použi Google účet, ktorý má povolený prístup.
              </p>
            </>
          ) : (
            <p className={styles.notice} role="status">
              Prihlásenie cez Google ešte nie je nastavené.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
