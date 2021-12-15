import { Box, SimpleGrid, Stack } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import React from "react";
import { convertImage } from "../../../lib/features/image/utils/imageUtils";
import { MultiParagraphImageBannerProps } from "../../../lib/features/page/content-sections.d";
import { Container } from "../../Shared/Container/Container";
import { Overlay } from "../../Shared/Overlay/Overlay";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import { Paragraph } from "./Paragraph";

export const MultiParagraphImageBanner = (
  props: MultiParagraphImageBannerProps
) => {
  const { heading, paragraphs, backgroundImage, ...restOfProps } = props;

  const bgImage = convertImage(backgroundImage);

  return (
    <Box {...restOfProps}>
      {bgImage && (
        <BackgroundImage {...bgImage} preserveStackingContext>
          <Overlay zIndex={0} opacity={70} />
          <Container py={backgroundImage ? 16 : 0} position="relative">
            <Stack spacing={{ base: 5, md: 8 }} alignItems={"center"}>
              <SectionHeading
                heading={heading.title}
                alignItems="center"
                superscript={heading.superscript}
                light
              />
              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3 }}
                gridGap={{ base: 4, md: 12 }}
              >
                {paragraphs.map((p) => (
                  <Paragraph
                    heading={p.title}
                    content={p.content}
                    link={p.link}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          </Container>
        </BackgroundImage>
      )}
    </Box>
  );
};
