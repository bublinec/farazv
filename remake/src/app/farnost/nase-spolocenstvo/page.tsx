import type { Metadata } from "next";
import { getPublicEditorialPage } from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { PageHero } from "@/components/ui/PageHero";
import { EditorialFeed } from "@/components/editorial/EditorialFeed";

export const metadata: Metadata = {
  title: "Naše spoločenstvo",
  description:
    "Farský časopis Naše spoločenstvo. Príbehy, zamyslenia a povzbudenia z našej farnosti.",
  alternates: { canonical: "/farnost/nase-spolocenstvo" }
};

export const dynamic = "force-dynamic";
export default async function ArticlesPage() {
  const initialPage = await getPublicEditorialPage("article").catch(() => null);
  return (
    <>
      <PageHero
        route="/farnost/nase-spolocenstvo"
        eyebrow="Farský časopis"
        title="Naše spoločenstvo"
        description="Miesto pre príbehy, zamyslenia a slová povzbudenia. Čítajte s nami."
      />
      <section className="section" aria-labelledby="all-articles">
        <div className="container">
          <h2
            id="all-articles"
            className="eyebrow"
            style={{ marginBottom: "1.5rem" }}
          >
            Z nášho časopisu
          </h2>
          {initialPage ? (
            <EditorialFeed initialPage={initialPage} kind="article" />
          ) : (
            <Unavailable />
          )}
        </div>
      </section>
    </>
  );
}
