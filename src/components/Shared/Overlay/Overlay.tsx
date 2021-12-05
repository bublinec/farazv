import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface OverlayProps extends BoxProps {}

export const Overlay = (props: OverlayProps) => {
  const { opacity = 30, zIndex = 1, color = "black", ...restOfProps } = props;
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
