import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <section className="section">
      <div
        className="container"
        style={{ textAlign: "center", paddingBlock: 70 }}
      >
        <h1>Stránka sa nenašla.</h1>
        <p style={{ color: "var(--muted)", marginBottom: 30 }}>
          Stránka mohla zmeniť adresu. Radi vám pomôžeme nájsť, čo hľadáte.
        </p>
        <Link href="/" className="button">
          Späť na úvod
          <Icon name="arrow-right" size={17} />
        </Link>
        <p style={{ marginTop: 25 }}>
          <Link href="/kontakt">Kontaktovať farnosť</Link>
        </p>
      </div>
    </section>
  );
}
