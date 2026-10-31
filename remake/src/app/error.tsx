"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Chvíľu strpenia</p>
        <h1>Obsah sa nepodarilo načítať.</h1>
        <p>
          Skúste to, prosím, ešte raz. Ostatné časti stránky môžete používať
          ďalej.
        </p>
        <button type="button" className="button" onClick={reset}>
          Skúsiť znova
        </button>
      </div>
    </section>
  );
}
