import { Box, BoxProps } from "@chakra-ui/react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { Image } from "../../../../lib/features/image/model/image.model";

export interface ImageCardProps extends Image, BoxProps {
  className?: string;
}

export const ImageCard = (props: ImageCardProps) => {
  const { className = "", alternativeText, localFile } = props;
  // @ts-ignore
  const extractedImage = getImage(localFile);

  return (
    <Box
      as="a"
      overflow={"hidden"}
      href={localFile.publicURL}
      cursor="pointer"
      {...props}
    >
      <Box
        _hover={{ transform: "scale(1.05)" }}
        h="full"
        display="flex"
        position="relative"
        transition="all ease-in-out 400ms"
      >
        {extractedImage && (
          <GatsbyImage image={extractedImage} alt="gallery image" />
        )}
      </Box>
    </Box>
  );
};
