import type { Metadata } from "next";
import { getPublicEditorialPage } from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { PageHero } from "@/components/ui/PageHero";
import { EditorialFeed } from "@/components/editorial/EditorialFeed";

export const metadata: Metadata = {
  title: "Zo života farnosti",
  description:
    "Aktuality, pozvánky a správy zo života Farnosti sv. Alžbety vo Zvolene.",
  alternates: { canonical: "/prispevky" }
};

export const dynamic = "force-dynamic";
export default async function NewsPage() {
  const initialPage = await getPublicEditorialPage("news").catch(() => null);
  return (
    <>
      <PageHero
        eyebrow="Sme tu spolu"
        title="Zo života farnosti"
        description="Pozvánky, novinky a chvíle, ktoré tvoria naše spoločenstvo."
      />
      <section className="section" aria-labelledby="all-news">
        <div className="container">
          <h2
            id="all-news"
            className="eyebrow"
            style={{ marginBottom: "1.5rem" }}
          >
            Aktuality a pozvánky
          </h2>
          {initialPage ? (
            <EditorialFeed initialPage={initialPage} kind="news" />
          ) : (
            <Unavailable />
          )}
        </div>
      </section>
    </>
  );
}
