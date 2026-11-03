import type { Metadata } from "next";
import type { EditorialDocument } from "@/content/documents";
import { hospitalMinistry } from "@/content/hospital-ministry";
import { churchDetails } from "@/content/church-details";
import { getPublicEntry } from "@/server/public-content";
import { PageHero } from "@/components/ui/PageHero";
import { Unavailable } from "@/components/ui/Unavailable";
import { HospitalMinistryContent } from "@/components/information/HospitalMinistryContent";

export const dynamic = "force-dynamic";

const description =
  "Sväté omše, prijímanie na izbách, spoveď a pomazanie chorých v Nemocnici AGEL Zvolen. Kontakty na kňazov a plán areálu.";

export const metadata: Metadata = {
  title: hospitalMinistry.title,
  description,
  alternates: { canonical: hospitalMinistry.href }
};

export default async function HospitalMinistryPage() {
  let article: EditorialDocument | null = null;
  let articleUnavailable = false;

  try {
    article = await getPublicEntry("news", hospitalMinistry.serviceRosterSlug);
  } catch {
    articleUnavailable = true;
  }

  return (
    <>
      <PageHero
        route={hospitalMinistry.href}
        title={hospitalMinistry.title}
        description="Sviatosti a duchovná blízkosť pre pacientov a ich blízkych."
        image={churchDetails.chapel}
      />
      <HospitalMinistryContent article={article} />
      {articleUnavailable ? (
        <section className="container section">
          <Unavailable
            compact
            title="Doplňujúce informácie sú dočasne nedostupné."
          />
        </section>
      ) : null}
    </>
  );
}
