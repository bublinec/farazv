import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface SuperscriptProps extends BoxProps {
  children: string;
}

export const Superscript = (props: SuperscriptProps) => {
  const { children, fontSize = "md", ...restOfProps } = props;
  return (
    <Box
      {...restOfProps}
      fontSize={fontSize}
      fontWeight="600"
      color="primary"
      textTransform="uppercase"
    >
      {children}
    </Box>
  );
};
