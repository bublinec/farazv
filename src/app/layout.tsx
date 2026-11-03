import type { Metadata } from "next";
import { isPublicRelease, pageMetadata } from "@/lib/seo";
import { Footer } from "@/components/layout/Footer";
import { SiteShell } from "@/components/layout/SiteShell";
import { VisitorAnalytics } from "@/components/layout/VisitorAnalytics";
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
  robots: { index: isPublicRelease(), follow: isPublicRelease() },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: pageMetadata({
    title: `${siteConfig.name} ${siteConfig.city}`,
    description: siteConfig.description,
    path: "/"
  }).openGraph
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
        {process.env.VERCEL_ENV === "production" ? <VisitorAnalytics /> : null}
      </body>
    </html>
  );
}
