import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface IframeProps extends BoxProps {
  url: string;
}

export const Iframe = (props: IframeProps) => {
  const { url, ...restOfProps } = props;

  return (
    <Box {...restOfProps} boxShadow="xl" bg="darkGray">
      <iframe
        src={url}
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
      ></iframe>
    </Box>
  );
};
