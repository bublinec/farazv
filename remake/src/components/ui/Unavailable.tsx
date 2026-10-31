import Link from "next/link";
export function Unavailable({
  title = "Obsah je dočasne nedostupný.",
  compact = false
}: {
  title?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={compact ? "unavailable compactUnavailable" : "unavailable"}
      role="status"
    >
      <h2>{title}</h2>
      <p>
        Skúste stránku o chvíľu obnoviť. Ostatné informácie môžete používať
        ďalej.
      </p>
      <Link href="/kontakt">Kontakty na farnosť →</Link>
    </div>
  );
}
