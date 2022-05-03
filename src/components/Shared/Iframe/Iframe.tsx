import { AspectRatio, Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface IframeProps extends BoxProps {
  url: string;
}

export const Iframe = (props: IframeProps) => {
  const { url, ...restOfProps } = props;

  return (
    <Box {...restOfProps} bg="darkGray">
      <AspectRatio ratio={1.78} backgroundColor="white">
        <iframe
          src={url}
          width="100%"
          height="100%"
          loading="lazy"
          allowFullScreen
        ></iframe>
      </AspectRatio>
    </Box>
  );
};
