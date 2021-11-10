import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { ComponentPlaceholder } from "./components/ComponentPlaceholder";

export interface ContentRendererProps extends BoxProps {
  contentSections: any[];
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
                <div>Text</div>;
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
