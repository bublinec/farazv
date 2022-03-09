import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { ReactNode } from "react-markdown";

export interface HeadingProps extends BoxProps {
  children: string | ReactNode | ReactNode[];
}

export const Heading = (props: HeadingProps) => {
  const {
    children,
    color = "darkGray",
    fontWeight = 600,
    ...restOfProps
  } = props;
  return (
    <Box
      {...restOfProps}
      as="h2"
      lineHeight={{ base: 9, sm: "unset" }}
      fontSize={{ base: "2xl", md: "3xl", xl: "4xl" }}
      fontWeight="500"
      color={color}
    >
      {children}
    </Box>
  );
};
