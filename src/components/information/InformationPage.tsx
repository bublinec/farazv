import type { InformationPageDefinition } from "@/content/information";
import { ContactPage } from "./ContactPage";
import { SacramentPage } from "./SacramentPage";
import { ParishPage } from "./ParishPage";
import { SaintElizabethChurchPage } from "./SaintElizabethChurchPage";
import { ChurchPage } from "./ChurchPage";
import { CommunityPage, SchoolPage, ResourcePage } from "./ParishPages";

export function InformationPage({ page }: { page: InformationPageDefinition }) {
  switch (page.kind) {
    case "sacrament":
      return <SacramentPage page={page} />;
    case "contact":
      return <ContactPage page={page} />;
    case "church":
      return page.slug === "farnost/kostol-sv-alzbety" ? (
        <SaintElizabethChurchPage page={page} />
      ) : (
        <ChurchPage page={page} />
      );
    case "parish":
      return <ParishPage page={page} />;
    case "community":
      return <CommunityPage page={page} />;
    case "school":
      return <SchoolPage page={page} />;
    case "resource":
      return <ResourcePage page={page} />;
  }
}
