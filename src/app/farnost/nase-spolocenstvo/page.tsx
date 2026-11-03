import { pageMetadata } from "@/lib/seo";
import { getPublicEditorialPage } from "@/server/public-content";
import { Unavailable } from "@/components/ui/Unavailable";
import { PageHero } from "@/components/ui/PageHero";
import { EditorialFeed } from "@/components/editorial/EditorialFeed";

export const metadata = pageMetadata({
  title: "Naše spoločenstvo",
  description:
    "Farský časopis Naše spoločenstvo. Príbehy, zamyslenia a povzbudenia z našej farnosti.",
  path: "/farnost/nase-spolocenstvo"
});

export const dynamic = "force-dynamic";
export default async function ArticlesPage() {
  const initialPage = await getPublicEditorialPage("article").catch(() => null);
  return (
    <>
      <PageHero
        route="/farnost/nase-spolocenstvo"
        title="Naše spoločenstvo"
        description="Farský časopis s príbehmi, zamysleniami a slovami povzbudenia z našej farnosti."
      />
      <section className="section" aria-labelledby="all-articles">
        <div className="container">
          <h2 id="all-articles" className="srOnly">
            Články
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
