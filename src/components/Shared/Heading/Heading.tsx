import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface HeadingProps extends BoxProps {
  children: string;
}

export const Heading = (props: HeadingProps) => {
  const { children, ...restOfProps } = props;
  return (
    <Box
      {...restOfProps}
      as="h2"
      fontSize="5xl"
      fontWeight="600"
      color="darkGray"
    >
      {children}
    </Box>
  );
};
