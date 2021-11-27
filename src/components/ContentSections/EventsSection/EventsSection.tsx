import { Box, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { EventsSectionProps } from "../../../lib/features/page/content-sections.d";
import { Container } from "../../Shared/Container/Container";
import { ImageLink } from "../../Shared/ImageLink/ImageLink";
import { Text } from "../Text/Text";

export const EventsSection = (props: EventsSectionProps) => {
  const { heading, events, ...restOfProps } = props;
  console.log(events);

  return (
    <Box {...restOfProps}>
      <Container>
        <Text {...heading} />
        <SimpleGrid
          columns={{ base: 1, md: 3, xl: events.length }}
          gridGap={16}
          mt={10}
        >
          {events.map((e) => (
            <ImageLink href={e.link} image={e.poster} w="full" />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};
