import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicEntry,
  getPublicEditorialPage,
  isFixtureMode
} from "@/server/public-content";
import {
  EditorialDetail,
  editorialMetadata
} from "@/components/editorial/EditorialDetail";
import { Unavailable } from "@/components/ui/Unavailable";
type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const entry = await getPublicEntry("notice", slug);
    return entry
      ? editorialMetadata(entry, "news", true)
      : { title: "Obsah sa nenašiel" };
  } catch {
    return {
      title: "Obsah je dočasne nedostupný",
      robots: { index: false, follow: false }
    };
  }
}
export default async function DetailPage({ params }: Props) {
  const { slug } = await params;
  let entry;
  try {
    entry = await getPublicEntry("notice", slug);
  } catch {
    return (
      <section className="container section">
        <Unavailable />
      </section>
    );
  }
  if (!entry) notFound();
  const related = await getPublicEditorialPage("news")
    .then((page) =>
      page.items.filter((item) => item.id !== entry.id).slice(0, 3)
    )
    .catch(() => []);
  return (
    <EditorialDetail
      entry={entry}
      kind="news"
      related={related}
      preview={isFixtureMode()}
    />
  );
}
