import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findInformationPage, informationPages } from "@/content/information";
import { pageGroupForRoute } from "@/content/page-documents";
import { InformationPage } from "@/components/information/InformationPage";
import { EditablePage } from "@/components/information/EditablePage";
import { pageMetadata } from "@/lib/seo";
import { getPageCover } from "@/content/page-photographs";
import { getPublicPage } from "@/server/public-content";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// Office facts remain current after publishing settings, including on pages
// whose long-form reading copy is maintained as static source-controlled TSX.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return informationPages.map((page) => ({ slug: page.slug.split("/") }));
}

/** A page published in the administration replaces its code version. */
async function editablePage(route: string) {
  return pageGroupForRoute(route) ? getPublicPage(route) : null;
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = slug.join("/");
  const edited = await editablePage(route);

  if (edited)
    return pageMetadata({
      title: edited.title,
      description: edited.introduction,
      path: `/${edited.route}`,
      image: edited.cover ?? getPageCover(`/${route}`)?.image
    });

  const page = findInformationPage(route);
  if (!page) return {};
  const cover = getPageCover(`/${page.slug}`)?.image;

  return pageMetadata({
    title: page.title,
    description: page.introduction,
    path: `/${page.slug}`,
    image: cover
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const route = slug.join("/");
  const edited = await editablePage(route);
  if (edited) return <EditablePage page={edited} />;

  const page = findInformationPage(route);
  if (!page) notFound();
  return <InformationPage page={page} />;
}
