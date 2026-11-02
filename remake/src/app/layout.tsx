import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { SiteShell } from "@/components/layout/SiteShell";
import { getPublicSettings } from "@/server/public-content";
import { siteConfig } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Farnosť sv. Alžbety Zvolen – mesto",
    template: "%s | Farnosť Zvolen – mesto"
  },
  description: siteConfig.description,
  applicationName: `${siteConfig.name} · ${siteConfig.city}`,
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
  const settings = await getPublicSettings().catch(() => null);
  return (
    <html lang="sk" data-scroll-behavior="smooth">
      <body>
        <SiteShell footer={<Footer settings={settings} />}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
