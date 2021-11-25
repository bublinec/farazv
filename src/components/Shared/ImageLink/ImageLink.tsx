import { Box, BoxProps } from "@chakra-ui/react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";

export interface ImageLinkProps extends BoxProps {
  href: string;
  image: any;
  external?: boolean;
}

export const ImageLink = (props: ImageLinkProps) => {
  const { href, image, external = true, ...restOfProps } = props;
  const extractedImage = getImage(image.localFile);

  return (
    <a href={href} target={external ? "_blank" : "_self"}>
      <Box {...restOfProps}>
        {extractedImage && <GatsbyImage image={extractedImage} alt="" />}
      </Box>
    </a>
  );
};
