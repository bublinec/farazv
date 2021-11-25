import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { Subheading } from "../Subheading/Subheading";
import { Underline } from "../Underline/Underline";

export interface SectionHeadingSmallProps extends BoxProps {
  heading: string;
}

export const SectionHeadingSmall = (props: SectionHeadingSmallProps) => {
  const { heading, color = "primary", ...restOfProps } = props;
  return (
    <Box {...restOfProps} w="max-content" mb={3}>
      <Subheading color={color}>{heading}</Subheading>
      <Underline maxW={120} color={"white"} />
    </Box>
  );
};
