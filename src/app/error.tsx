"use client";

import { TechnicalSupport } from "@/components/ui/TechnicalSupport";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section">
      <div className="container">
        <h1>Obsah sa nepodarilo načítať.</h1>
        <p>
          Skúste to, prosím, ešte raz. Ostatné časti stránky môžete používať
          ďalej.
        </p>
        <TechnicalSupport />
        <button type="button" className="button" onClick={reset}>
          Skúsiť znova
        </button>
      </div>
    </section>
  );
}
