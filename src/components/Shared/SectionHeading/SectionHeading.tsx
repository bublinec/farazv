import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { ReactNode } from "react-markdown";
import { Heading } from "../Heading/Heading";
import { Superscript } from "../Superscript/Superscript";
import { Underline } from "../Underline/Underline";

export interface SectionHeadingProps extends BoxProps {
  heading: string | ReactNode | ReactNode[];
  superscript?: string;
  light?: boolean;
}

export const SectionHeading = (props: SectionHeadingProps) => {
  const {
    heading,
    superscript,
    mb = { base: 4, md: 5 },
    light = false,
    alignItems = "flex-start",
    ...restOfProps
  } = props;
  return (
    <Box {...restOfProps} w={{ base: "max-content" }} maxW="full" mb={mb}>
      <Stack alignItems={alignItems} spacing={0}>
        {superscript && (
          <Superscript mb={-1} color={light ? "secondary" : "primary"}>
            {superscript}
          </Superscript>
        )}
        <Heading
          color={light ? "white" : "darkGray"}
          fontWeight={light ? 500 : 600}
        >
          {heading}
        </Heading>
        <Underline maxW={280} w="full" alignItems={alignItems} />
      </Stack>
    </Box>
  );
};
