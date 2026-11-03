import { Box, Stack } from "@chakra-ui/react";
import React from "react";
import { TextProps } from "../../../lib/features/page/content-sections.d";
import { MarkdownRenderer } from "../../Shared/MarkdownRenderer/MarkdownRenderer";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";

export const Text = (props: TextProps) => {
  const {
    title,
    content,
    superscript,
    info,
    light = false,
    alignItems = "flex-start",
    ...restOfProps
  } = props;
  return (
    <Box {...restOfProps}>
      <Stack alignItems={alignItems}>
        {title && (
          <SectionHeading
            heading={title}
            superscript={superscript}
            light={light}
            alignItems={alignItems}
          />
        )}
        {content && (
          <MarkdownRenderer
            light={light}
            maxW="full"
            textAlign={alignItems === "center" ? "center" : "left"}
            fontWeight={light ? 300 : 400}
          >
            {content}
          </MarkdownRenderer>
        )}
      </Stack>
    </Box>
  );
};
