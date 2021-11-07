import { Box, BoxProps, Text } from "@chakra-ui/react";
import React from "react";
import ReactMarkdown from "react-markdown";
import { HeadingTitle } from "../Heading/HeadingTitle";
import { Subheading } from "../Heading/Subheading";

export interface MarkdownRendererProps extends BoxProps {
  children?: string;
}

export const MarkdownRenderer = (props: MarkdownRendererProps) => {
  const { children, color, ...restOfProps } = props;

  return (
    <Box {...restOfProps} color={color || "body.500"}>
      {children && (
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <HeadingTitle as="h1" color={color || "secondary.500"}>
                {children}
              </HeadingTitle>
            ),
            h2: ({ children }) => (
              <Subheading as="h2" color={color || "primary.500"}>
                {children}
              </Subheading>
            ),
            h3: ({ children }) => (
              <Text
                as="h3"
                fontSize="md"
                fontWeight="bold"
                color={color || "secondary.500"}
              >
                {children}
              </Text>
            ),
            h4: ({ children }) => (
              <Text as="h4" fontSize="md" fontWeight="bold">
                {children}
              </Text>
            ),
            p: ({ children }) => (
              <Text as="p" fontSize="md" mb={4}>
                {children}
              </Text>
            ),
            ul: ({ children }) => (
              <ul
                style={{ listStyleType: "square", padding: "20px 0 20px 20px" }}
              >
                {children}
              </ul>
            ),
            strong: ({ children }) => (
              <Text as="strong" fontWeight="500" color={color || "primary.500"}>
                {children}
              </Text>
            )
          }}
        >
          {children}
        </ReactMarkdown>
      )}
    </Box>
  );
};
