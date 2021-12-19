import { Box, Stack } from "@chakra-ui/react";
import React from "react";
import { ImagesTextGridProps } from "../../../lib/features/page/content-sections.d";
import { Container } from "../../Shared/Container/Container";
import { ImageParagraph } from "../../Shared/ImageParagraph/ImageParagraph";
import { Text } from "../Text/Text";

export const ImagesTextGrid = (props: ImagesTextGridProps) => {
  const { paragraphs, heading, ...restOfProps } = props;

  return (
    <Box {...restOfProps}>
      <Container maxW="container.lg">
        <Text {...heading} mb={{ base: 2, md: 10 }} />
        <Stack spacing={14}>
          {paragraphs.map((p, i) => (
            <ImageParagraph isImageOnTheLeft={!!(i & 1)} {...p} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
};
