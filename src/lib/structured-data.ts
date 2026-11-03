import { siteConfig } from "@/content/site";
import { aerialImage } from "@/content/assets";
import type { EditorialDocument, SettingsDocument } from "@/content/documents";

export function serializeStructuredData(value: object) {
  // Published editorial strings must not be able to close the script element.
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function websiteStructuredData(settings: SettingsDocument | null) {
  const url = new URL("/", siteConfig.url).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        url,
        name: `${siteConfig.name} ${siteConfig.city}`,
        alternateName: "Farnosť Zvolen – mesto",
        inLanguage: "sk",
        publisher: { "@id": `${url}#parish` }
      },
      {
        "@type": "Organization",
        "@id": `${url}#parish`,
        url,
        name: `${siteConfig.name} ${siteConfig.city}`,
        description: siteConfig.description,
        logo: new URL("/icons/church-192.png", url).href,
        image: aerialImage.src,
        ...(settings?.phone ? { telephone: settings.phone } : {}),
        ...(settings?.email ? { email: settings.email } : {}),
        ...(settings?.address ? { address: settings.address } : {})
      }
    ]
  };
}

export function editorialStructuredData(
  entry: EditorialDocument,
  path: string
) {
  const url = new URL(path, siteConfig.url).href;
  const home = new URL("/", siteConfig.url).href;
  return {
    "@context": "https://schema.org",
    "@type": entry.isPoster ? "WebPage" : "Article",
    "@id": url,
    url,
    mainEntityOfPage: url,
    headline: entry.title,
    name: entry.title,
    description: entry.excerpt,
    inLanguage: "sk",
    datePublished: entry.date,
    ...(entry.cover ? { image: [entry.cover.src] } : {}),
    ...(entry.author
      ? { author: { "@type": "Person", name: entry.author } }
      : {}),
    publisher: {
      "@type": "Organization",
      "@id": `${home}#parish`,
      name: `${siteConfig.name} ${siteConfig.city}`,
      url: home
    }
  };
}
