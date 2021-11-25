import { Box, BoxProps } from "@chakra-ui/react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { Image } from "../../../../lib/features/image/model/image.model";

export interface ImageCardProps extends Image, BoxProps {
  className?: string;
}

export const ImageCard = (props: ImageCardProps) => {
  const { className = "", alternativeText, localFile } = props;
  const extractedImage = getImage(localFile);

  // Use like this:
  const bgImage = convertToBgImage(extractedImage);

  return (
    <Box
      as="a"
      className={`${className} relative shadow-md overflow-hidden rounded-md hover:shadow-2xl transition-all duration-300 ease-in-out`}
      display="flex"
      {...props}
      href={localFile.publicURL}
    >
      <GatsbyImage image={extractedImage} />
    </Box>
  );
};
