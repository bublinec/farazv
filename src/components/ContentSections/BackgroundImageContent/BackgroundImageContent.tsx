import { Box } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import React from "react";
import { convertImage } from "../../../lib/features/image/utils/imageUtils";
import { BackgroundImageContentProps } from "../../../lib/features/page/content-sections.d";
import { Container } from "../../Shared/Container/Container";
import { ImageParagraph } from "../../Shared/ImageParagraph/ImageParagraph";
import { Overlay } from "../../Shared/Overlay/Overlay";

export const BackgroundImageContent = (props: BackgroundImageContentProps) => {
  const { imageParagraph, backgroundImage, ...restOfProps } = props;

  const bgImage = convertImage(backgroundImage);

  return (
    <Box {...restOfProps} py={5}>
      {bgImage && (
        <BackgroundImage {...bgImage} preserveStackingContext>
          <Overlay zIndex={0} opacity={70} />
          <Container py={backgroundImage ? 14 : 0} position="relative">
            <ImageParagraph {...imageParagraph} />
          </Container>
        </BackgroundImage>
      )}
    </Box>
  );
};
