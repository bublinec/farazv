import { Box, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { ImageLinksProps } from "../../../lib/features/page/content-sections.d.";
import { Container } from "../../Shared/Container/Container";
import { ImageLink } from "../../Shared/ImageLink/ImageLink";
import { Text } from "../Text/Text";

export const ImageLinks = (props: ImageLinksProps) => {
  const { heading, images, ...restOfProps } = props;

  return (
    <Box {...restOfProps}>
      <Container>
        <Text {...heading} />
        <SimpleGrid
          columns={{ base: 1, md: 3, xl: images.length }}
          gridGap={16}
          mt={10}
        >
          {images.map((i) => (
            <ImageLink href={i.url} image={i.image} w="full" />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};
