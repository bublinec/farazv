import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { ArrowButtonLink } from "../../Shared/ArrowButtonLink/ArrowButtonLink";

export interface ParagraphProps extends BoxProps {
  heading: string;
  content: string;
  link?: string;
}

export const Paragraph = (props: ParagraphProps) => {
  const { heading, content, link, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Stack alignItems="center" textAlign="center">
        {/* <SectionHeadingSmall heading={heading} color="white" /> */}
        <Box
          color="white"
          fontWeight={400}
          textTransform={"uppercase"}
          fontSize={"xl"}
        >
          {heading}
        </Box>
        <Box color="white" fontWeight={200}>
          {content}
        </Box>
        {link && (
          <ArrowButtonLink
            href={link}
            buttonProps={{
              pt: { base: 1, md: 2 }
            }}
          />
        )}
      </Stack>
    </Box>
  );
};
