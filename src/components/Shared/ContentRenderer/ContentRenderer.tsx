import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { ContentSection } from "../../../lib/features/page/content-sections.d.";
import { AnnouncementsSection } from "../../ContentSections/AnnouncementsSection/AnnouncementsSection";
import { Text } from "../../ContentSections/Text/Text";
import { Container } from "../Container/Container";
import { ComponentPlaceholder } from "./components/ComponentPlaceholder";

export interface ContentRendererProps extends BoxProps {
  contentSections: ContentSection[];
}

export const COMPONENT_PREFIX = "STRAPI_ComponentSections";

export const ContentRenderer = (props: ContentRendererProps) => {
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
                return;
                <Container>
                  <Text {...props} />;
                </Container>;
              case "AnnouncementsSection":
                return <AnnouncementsSection {...props} />;
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
