import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface SubheadingProps extends BoxProps {
  children: string;
}

export const Subheading = (props: SubheadingProps) => {
  const { children, color = "primary", ...restOfProps } = props;
  return (
    <Box {...restOfProps} as="h3" fontSize="2xl" fontWeight="500" color={color}>
      {children}
    </Box>
  );
};
