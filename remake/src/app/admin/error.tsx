"use client";
import styles from "@/components/admin/Admin.module.css";
export default function AdminError({
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className={styles.panel}>
      <h1>Redakciu sa nepodarilo načítať</h1>
      <p>
        Skontrolujte prihlásenie a pripojenie. Obsah na serveri ostal zachovaný.
      </p>
      <button className={styles.button} type="button" onClick={reset}>
        Skúsiť znova
      </button>
      <p>
        <a href="/admin/login">Otvoriť prihlásenie</a>
      </p>
    </section>
  );
}
