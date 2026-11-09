import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireEditorPage } from "@/server/auth";
import { getRecord } from "@/server/content-store";
import { getPublicPageLinks, getPublicSettings } from "@/server/public-content";
import { navigationWithPages } from "@/content/navigation";
import { EditablePage } from "@/components/information/EditablePage";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import theme from "@/components/layout/ParishTheme.module.css";

export const metadata: Metadata = {
  title: "Náhľad stránky",
  robots: { index: false, follow: false }
};
export const dynamic = "force-dynamic";

/** The last saved page draft inside the public site chrome, for the editor's preview. */
export default async function PagePreview({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditorPage();
  const { id } = await params;
  const record = await getRecord(id);
  if (!record || record.kind !== "page") notFound();

  const [settings, addedPages] = await Promise.all([
    getPublicSettings().catch(() => null),
    getPublicPageLinks()
  ]);

  return (
    <div className={theme.parish}>
      <Header items={navigationWithPages(addedPages)} />
      <main id="main" tabIndex={-1}>
        <EditablePage page={record.draft} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
