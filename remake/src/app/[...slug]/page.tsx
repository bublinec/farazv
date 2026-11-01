import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findInformationPage, informationPages } from "@/content/information";
import { InformationPage } from "@/components/information/InformationPage";
import { siteConfig } from "@/content/site";
import { getPageCover } from "@/content/page-photographs";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// Office facts remain current after publishing settings, including on pages
// whose long-form reading copy is maintained as static source-controlled TSX.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return informationPages.map((page) => ({ slug: page.slug.split("/") }));
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = findInformationPage(slug.join("/"));
  if (!page) return {};
  const cover = getPageCover(`/${page.slug}`)?.image;

  return {
    title: page.title,
    description: page.introduction,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.introduction,
      url: `/${page.slug}`,
      siteName: siteConfig.name,
      locale: "sk_SK",
      type: "website",
      ...(cover
        ? {
            images: [
              {
                url: cover.src,
                width: cover.width,
                height: cover.height,
                alt: cover.alt || page.title
              }
            ]
          }
        : {})
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = findInformationPage(slug.join("/"));
  if (!page) notFound();
  return <InformationPage page={page} />;
}
