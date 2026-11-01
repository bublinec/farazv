import { requirePublishedInformationContent } from "@/content/information";
import type { MediaAsset } from "@/content/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImageGallery } from "./ImageGallery";
import styles from "./HistoricalChurchGallery.module.css";

export const historicalGallerySectionId = "components_sections_galleries-10";

/** Both history pages share the complete original gallery, without copying assets. */
export function HistoricalChurchGallery() {
  const source = requirePublishedInformationContent(
    "/farnost/kostol-sv-alzbety"
  );
  const section = source.sections.find(
    (entry) => entry.id === historicalGallerySectionId
  );
  if (!section) throw new Error("Missing original historical church gallery.");

  const images = section.body.content
    .filter((node) => node.type === "imageGallery")
    .flatMap((node) => (node.attrs?.images as MediaAsset[]) ?? [])
    .map((image, index) => ({
      ...image,
      alt: image.alt || `Historický pohľad na kostol – ${index + 1}`
    }));

  if (!images.length)
    throw new Error("The historical church gallery is empty.");

  return (
    <section
      id="historicka-galeria"
      className={styles.section}
      aria-label="Historická galéria kostola"
    >
      <div className="container">
        <SectionHeading title="Historická galéria kostola" />
        <ImageGallery images={images} initialCount={images.length} />
      </div>
    </section>
  );
}
