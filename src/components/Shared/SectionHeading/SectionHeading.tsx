import { Box, BoxProps, HStack, Stack } from "@chakra-ui/react";
import React from "react";
import { BsPerson } from "react-icons/bs";
import { ReactNode } from "react-markdown";
import { Heading } from "../Heading/Heading";
import { IconDate } from "../IconDate/IconDate";
import { IconText } from "../IconText/IconText";
import { Superscript } from "../Superscript/Superscript";
import { Underline } from "../Underline/Underline";

export interface SectionHeadingProps extends BoxProps {
  heading: string | ReactNode | ReactNode[];
  superscript?: string;
  light?: boolean;
  author?: string;
  date?: string;
}

export const SectionHeading = (props: SectionHeadingProps) => {
  const {
    heading,
    superscript,
    mb = { base: 4, md: 5 },
    light = false,
    alignItems = "flex-start",
    author,
    date,
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
          <Superscript mb={-1.5} color={light ? "secondary" : "primary"}>
            {superscript}
          </Superscript>
        )}
        <Heading
          color={light ? "white" : "darkGray"}
          fontWeight={light ? 500 : 600}
        >
          {heading}
        </Heading>
        <Underline
          maxW={{ base: 120, md: 200 }}
          w="full"
          alignItems={alignItems}
        />
        <HStack spacing={8}>
          {author && <IconText icon={<BsPerson />} text={author} />}
          {date && <IconDate dateStr={date} />}
        </HStack>
      </Stack>
    </Box>
  );
};
