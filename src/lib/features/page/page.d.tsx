import { ContentSection } from "./content-sections.d.";
import { Image } from "./image.d";

export interface AdminPage {
  title: string;
  slug: string;
  description: string;
  image: Image;
  contentSections: ContentSection[];
}
