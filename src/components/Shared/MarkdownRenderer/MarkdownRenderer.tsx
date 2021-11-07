import { Box, BoxProps, Heading, Text } from "@chakra-ui/react";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Subheading } from "../Subheading/Subheading";

export interface MarkdownRendererProps extends BoxProps {
  children?: string;
}

export const MarkdownRenderer = (props: MarkdownRendererProps) => {
  const { children, color, ...restOfProps } = props;

  return (
    <Box {...restOfProps} color={color || "darkGray"}>
      {children && (
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <Heading as="h1" color={color}>
                {children}
              </Heading>
            ),
            h2: ({ children }) => (
              <Subheading as="h2" color={color}>
                {children}
              </Subheading>
            ),
            h3: ({ children }) => (
              <Text as="h3" fontSize="md" fontWeight="bold" color={color}>
                {children}
              </Text>
            ),
            h4: ({ children }) => (
              <Text as="h4" fontSize="md" fontWeight="bold">
                {children}
              </Text>
            ),
            p: ({ children }) => (
              <Text as="p" fontSize="md" mb={2}>
                {children}
              </Text>
            ),
            ul: ({ children }) => (
              <ul
                style={{ listStyleType: "square", padding: "6px 0 20px 20px" }}
              >
                {children}
              </ul>
            ),
            strong: ({ children }) => (
              <Text as="strong" fontWeight="500" color={color || "primary"}>
                {children}
              </Text>
            ),
            a: (props) => {
              return (
                <a href={props.href} rel={"noopener norefer"} target={"_blank"}>
                  <Text
                    as="strong"
                    fontWeight="500"
                    color={color || "primary"}
                    _hover={{
                      color: "primaryShade",
                      transition: "all ease-in-out 200ms"
                    }}
                  >
                    {props.children}
                  </Text>
                </a>
              );
            }
          }}
        >
          {children}
        </ReactMarkdown>
      )}
    </Box>
  );
};
