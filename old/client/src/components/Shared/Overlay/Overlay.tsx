import { Box, BoxProps } from "@chakra-ui/react";
import * as React from 'react';

export interface OverlayProps extends BoxProps {}

export const Overlay = (props: OverlayProps) => {
  const { opacity = 40, zIndex = 1, color = "#282828", ...restOfProps } = props;
  return (
    <Box
      bg={color}
      zIndex={zIndex}
      opacity={`${opacity}%`}
      h="full"
      w="full"
      position="absolute"
      {...restOfProps}
    />
  );
};
