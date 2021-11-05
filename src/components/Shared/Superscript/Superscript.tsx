import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface SuperscriptProps extends BoxProps {
  children: string;
}

export const Superscript = (props: SuperscriptProps) => {
  const { children, ...restOfProps } = props;
  return (
    <Box
      {...restOfProps}
      fontSize="lg"
      fontWeight="600"
      color="primary"
      textTransform="uppercase"
    >
      {children}
    </Box>
  );
};
