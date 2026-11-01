import type { InformationPageDefinition } from "@/content/information";
import { ContactPage } from "./ContactPage";
import { SacramentPage } from "./SacramentPage";
import { VirtualTourPage } from "./VirtualTourPage";
import {
  ChurchPage,
  CommunityPage,
  SchoolPage,
  GalleryPage,
  ResourcePage
} from "./ParishPages";

export function InformationPage({ page }: { page: InformationPageDefinition }) {
  switch (page.kind) {
    case "sacrament":
      return <SacramentPage page={page} />;
    case "contact":
      return <ContactPage page={page} />;
    case "church":
      return <ChurchPage page={page} />;
    case "community":
      return <CommunityPage page={page} />;
    case "school":
      return <SchoolPage page={page} />;
    case "gallery":
      return <GalleryPage page={page} />;
    case "tour":
      return <VirtualTourPage page={page} />;
    case "resource":
      return <ResourcePage page={page} />;
  }
}
