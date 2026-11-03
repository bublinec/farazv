"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="sk">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: "3rem auto",
          padding: "1rem",
          maxWidth: 640
        }}
      >
        <main>
          <h1>Stránku sa nepodarilo načítať.</h1>
          <p>Skúste to, prosím, ešte raz.</p>
          <button
            type="button"
            onClick={reset}
            style={{ padding: "0.75rem 1.25rem", font: "inherit" }}
          >
            Skúsiť znova
          </button>
          <p>
            Pri technických problémoch napíšte na{" "}
            <a href="mailto:jurajbublinec@gmail.com">jurajbublinec@gmail.com</a>
            .
          </p>
        </main>
      </body>
    </html>
  );
}
