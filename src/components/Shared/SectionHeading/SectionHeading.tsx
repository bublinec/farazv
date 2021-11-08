import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { ReactNode } from "react-markdown";
import { Heading } from "../Heading/Heading";
import { Superscript } from "../Superscript/Superscript";
import { Underline } from "../Underline/Underline";

export interface SectionHeadingProps extends BoxProps {
  heading: string | ReactNode | ReactNode[];
  superscript?: string;
}

export const SectionHeading = (props: SectionHeadingProps) => {
  const {
    heading,
    superscript,
    mb = { base: 2, md: 3 },
    ...restOfProps
  } = props;
  return (
    <Box {...restOfProps} w={{ md: "max-content" }} maxW="full" mb={mb}>
      {superscript && <Superscript mb={-1}>{superscript}</Superscript>}
      <Heading>{heading}</Heading>
      <Underline maxW={280} />
    </Box>
  );
};
