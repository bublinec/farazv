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
    <Box
      {...restOfProps}
      w={{ md: "max-content" }}
      maxW={{ md: "full" }}
      mb={mb}
    >
      <Stack alignItems={alignItems} spacing={{ base: 1 }}>
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
