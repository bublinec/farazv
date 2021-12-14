import { Box, Flex, GridItem, SimpleGrid } from "@chakra-ui/react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { ImageParagraphProps } from "../../../lib/features/page/content-sections.d";
import { MarkdownRenderer } from "../MarkdownRenderer/MarkdownRenderer";

export const ImageParagraph = (props: ImageParagraphProps) => {
  const { content, image, isImageOnTheLeft, ...restOfProps } = props;
  const extractedImage = getImage(image.localFile);

  return (
    <Box {...restOfProps}>
      <SimpleGrid
        columns={{ md: extractedImage ? 2 : 1 }}
        alignItems={"center"}
        gap={{ base: 10, md: 16 }}
      >
        <Flex justifyContent={"flex-end"}>
          {extractedImage && (
            <GatsbyImage image={extractedImage} alt={content.slice(20)} />
          )}
        </Flex>
        <GridItem gridRowStart={isImageOnTheLeft ? 0 : 1}>
          <MarkdownRenderer>{content}</MarkdownRenderer>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
};
