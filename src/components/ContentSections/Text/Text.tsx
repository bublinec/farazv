import { Box } from "@chakra-ui/react";
import React from "react";
import { TextProps } from "../../../lib/features/page/content-sections.d.";
import { MarkdownRenderer } from "../../Shared/MarkdownRenderer/MarkdownRenderer";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";

export const Text = (props: TextProps) => {
  const { title, content, superscript, info, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      {title && <SectionHeading heading={title} superscript={superscript} />}
      {content && <MarkdownRenderer>{content}</MarkdownRenderer>}
    </Box>
  );
};
