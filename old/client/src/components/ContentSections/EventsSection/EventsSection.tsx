import { Box, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { EventsSectionProps } from "../../../lib/features/page/content-sections.d";
import { ImageLink } from "../../Shared/ImageLink/ImageLink";
import { Text } from "../Text/Text";

export const EventsSection = (props: EventsSectionProps) => {
  const { heading, events, gridGap = { base: 10, md: 16 } } = props;

  return (
    <Box>
      {heading && (
        <Box mb={10} w="full">
          <Text {...heading} />
        </Box>
      )}
      <SimpleGrid
        columns={{ base: 2, sm: 3, xl: events.length }}
        gridGap={gridGap}
      >
        {events.map((e) => (
          <ImageLink href={e.link} image={e.poster} w="full" />
        ))}
      </SimpleGrid>
    </Box>
  );
};
