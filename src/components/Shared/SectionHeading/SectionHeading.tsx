import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { Heading } from "../Heading/Heading";
import { Superscript } from "../Superscript/Superscript";
import { Underline } from "../Underline/Underline";

export interface SectionHeadingProps extends BoxProps {
  heading: string;
  superscript?: string;
}

export const SectionHeading = (props: SectionHeadingProps) => {
  const { heading, superscript, ...restOfProps } = props;
  return (
    <Box {...restOfProps} w="max-content" mb={3}>
      {superscript && <Superscript mb={-1}>{superscript}</Superscript>}
      <Heading>{heading}</Heading>
      <Underline maxW={280} />
    </Box>
  );
};
