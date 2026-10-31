import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { SiteShell } from "@/components/layout/SiteShell";
import { getPublicSettings, isFixtureMode } from "@/server/public-content";
import { siteConfig } from "@/content/site";
import { getPublicDesign } from "@/server/public-design";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Farnosť sv. Alžbety Zvolen – mesto",
    template: "%s | Farnosť Zvolen – mesto"
  },
  description: siteConfig.description,
  robots: {
    index:
      process.env.SITE_INDEXING_ENABLED === "true" &&
      process.env.VERCEL_ENV === "production",
    follow:
      process.env.SITE_INDEXING_ENABLED === "true" &&
      process.env.VERCEL_ENV === "production"
  },
  openGraph: {
    locale: "sk_SK",
    siteName: "Farnosť Zvolen – mesto",
    type: "website"
  }
};

export const dynamic = "force-dynamic";
export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, design] = await Promise.all([
    getPublicSettings().catch(() => null),
    getPublicDesign()
  ]);
  const previewLabel = isFixtureMode()
    ? "Pracovný návrh novej stránky · Rozpis je ukážkový"
    : process.env.SITE_INDEXING_ENABLED !== "true"
    ? "Pracovná verzia novej stránky"
    : undefined;
  return (
    <html lang="sk" data-scroll-behavior="smooth">
      <body>
        <SiteShell
          footer={<Footer settings={settings} design={design} />}
          design={design}
          fixtureMode={isFixtureMode()}
          previewLabel={previewLabel}
        >
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
