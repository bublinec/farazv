import { Box, BoxProps } from "@chakra-ui/react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";

export interface ImageCardProps extends BoxProps {
  className?: string;
  image: any;
}

export const ImageCard = (props: ImageCardProps) => {
  const { className = "", image } = props;
  const extractedImage = getImage(image.localFile);

  return (
    <Box
      as="a"
      overflow={"hidden"}
      href={image.localFile.publicURL}
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
            <GatsbyImage image={extractedImage} alt={image.alternativeText} />
          )}
        </Box>
    </Box>
  );
};
