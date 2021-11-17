import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";

export interface ParagraphProps extends BoxProps {
  heading: string;
  content: string;
}

export const Paragraph = (props: ParagraphProps) => {
  const { heading, content, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Stack>
        {/* <SectionHeadingSmall heading={heading} color="white" /> */}
        <Box color="white" fontWeight={500} fontSize={"2xl"}>
          {heading}
        </Box>
        <Box color="white" fontWeight={200}>
          {content}
        </Box>
      </Stack>
    </Box>
  );
};
