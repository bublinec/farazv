import Link from "next/link";
import type { MediaAsset } from "@/content/types";
import { MediaImage } from "./MediaImage";

export function PageHero({
  title,
  eyebrow = "Farnosť Zvolen – mesto",
  description,
  image,
  breadcrumb
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  image?: MediaAsset;
  breadcrumb?: string;
}) {
  return (
    <section className={`pageHero ${image ? "pageHeroPhoto" : ""}`}>
      {image ? (
        <MediaImage
          image={image}
          priority
          className="pageHeroImage"
          sizes="100vw"
        />
      ) : null}
      <div className="container pageHeroContent">
        <nav className="breadcrumbs" aria-label="Navigačná cesta">
          <Link href="/">Domov</Link>
          <span aria-hidden="true">/</span>
          {breadcrumb ? (
            <>
              <span>{breadcrumb}</span>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span aria-current="page">{title}</span>
        </nav>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? (
          <p className="pageHeroDescription">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
