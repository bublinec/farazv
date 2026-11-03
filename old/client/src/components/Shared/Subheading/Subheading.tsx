import { Box, BoxProps, Text, TextProps } from "@chakra-ui/react";
import React from "react";
import { ReactNode } from "react-markdown";

export interface SubheadingProps extends TextProps {
  children: string | ReactNode | ReactNode[];
}

export const Subheading = (props: SubheadingProps) => {
  const {
    children,
    color = "primary",
    fontSize = { base: "xl", md: "2xl" },
    ...restOfProps
  } = props;
  return (
    <Text
      {...restOfProps}
      as="h3"
      fontSize={fontSize}
      fontWeight="500"
      color={color}
    >
      {children}
    </Text>
  );
};
