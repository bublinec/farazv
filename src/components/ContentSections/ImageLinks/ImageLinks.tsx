import { Box, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { ImageLinksProps } from "../../../lib/features/page/content-sections.d";
import { Container } from "../../Shared/Container/Container";
import { ImageLink } from "../../Shared/ImageLink/ImageLink";
import { Text } from "../Text/Text";

export const ImageLinks = (props: ImageLinksProps) => {
  const { heading, images } = props;

  return (
    <Box>
      <Container>
        <Text {...heading} textAlign={"center"} />
        <SimpleGrid
          columns={{ base: 3, md: 3, xl: images.length }}
          gridGap={{ base: 8, md: 14 }}
          mt={{ base: 6, md: 10 }}
        >
          {images.map((i) => (
            <ImageLink href={i.url} image={i.image} w="full" />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};
