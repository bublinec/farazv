import { Box } from "@chakra-ui/react";
import React from "react";

export interface IframeProps {
  iframeLink: string;
}

export const Iframe = (props: IframeProps) => {
  const { iframeLink, ...restOfProps } = props;

  return (
    <Box {...restOfProps}>
      <Box overflowY="hidden" boxShadow="xl">
        <iframe
          src={iframeLink}
          width="100%"
          height="105%" // hide bottom text
          loading="lazy"
        ></iframe>
      </Box>
    </Box>
  );
};
