import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { useEvents } from "../../../lib/features/events/hooks/useEvents";
import { useGroups } from "../../../lib/features/global/hooks/useGroups";
import { useSacraments } from "../../../lib/features/global/hooks/useSacraments";
import { ContentSection } from "../../../lib/features/page/content-sections.d";
import { AnnouncementsSection } from "../../ContentSections/AnnouncementsSection/AnnouncementsSection";
import { EventsSection } from "../../ContentSections/EventsSection/EventsSection";
import { Gallery } from "../../ContentSections/Gallery/Gallery";
import { ImagesTextGrid } from "../../ContentSections/ImageTextGrid/ImagesTextGrid";
import { MultiParagraphImageBanner } from "../../ContentSections/MultiParagraphImageBanner/MultiParagraphImageBanner";
import { PartnersSection } from "../../ContentSections/PartnersSection/PartnersSection";
import { Text } from "../../ContentSections/Text/Text";
import { Container } from "../Container/Container";
import { ComponentPlaceholder } from "./components/ComponentPlaceholder";

export interface DynamicZoneRendererProps extends BoxProps {
  contentSections: ContentSection[];
}

export const COMPONENT_PREFIX = "STRAPI_ComponentSections";

export const DynamicZoneRenderer = (props: DynamicZoneRendererProps) => {
  const { contentSections, ...restOfProps } = props;

  return (
    <Box {...restOfProps}>
      <Stack spacing={{ base: 10, md: 14 }}>
        {contentSections
          .filter((section) => Object.keys(section).length > 0)
          .map((section) => {
            const { __typename: sectionName, ...props } = section;
            const shortSectionName = sectionName.replace(COMPONENT_PREFIX, "");

            switch (shortSectionName) {
              case "Text":
                return (
                  <Container>
                    <Text {...props} />
                  </Container>
                );
              case "PartnersSection":
                return <PartnersSection {...props} />;
              case "AnnouncementsSection":
                return <AnnouncementsSection {...props} />;
              case "ImagesTextGrid":
                return <ImagesTextGrid {...props} />;
              case "Gallery":
                return <Gallery {...props} />;

              case "EventsSection":
                const recentEvents = useEvents();
                return (
                  <EventsSection
                    {...props}
                    events={props.useMostRecent ? recentEvents : props.events}
                  />
                );
              case "MultiParagraphImageBanner":
                const sacraments = useSacraments();
                const groups = useGroups();
                const configGlobalMap = {
                  sacraments,
                  groups,
                  custom: props
                };
                return (
                  <MultiParagraphImageBanner
                    // @ts-ignore
                    {...configGlobalMap[props.configuration]}
                  />
                );
              default:
                return (
                  <ComponentPlaceholder
                    name={shortSectionName}
                    sectionProps={props}
                  />
                );
            }
          })}
      </Stack>
    </Box>
  );
};
