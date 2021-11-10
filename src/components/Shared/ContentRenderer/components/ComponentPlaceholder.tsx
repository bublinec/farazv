import {
  Box,
  BoxProps,
  chakra,
  Container,
  SimpleGrid,
  Text
} from "@chakra-ui/react";
import React from "react";

export interface ComponentPlaceholderProps extends BoxProps {
  name: string;
  sectionProps: any;
}

export const ComponentPlaceholder = (props: ComponentPlaceholderProps) => {
  const { name, sectionProps, ...restOfProps } = props;

  return (
    <Box {...restOfProps} py={10} bg="green.100">
      <Container maxW="container.xl">
        <SimpleGrid textAlign="center" spacingY={12}>
          <Box>
            <Text fontSize="xl">We are just developing</Text>
            <Text fontSize="6xl">{name}</Text>
            {/* consider JSON viewer as a dev dependency */}
            <Box mt={4} fontSize="xl" textAlign="left" mx="auto">
              {Object.keys(sectionProps).map((p) => (
                <Text key={p} maxW="container.xl">
                  <chakra.span fontWeight="bold">{p}: </chakra.span>
                  {JSON.stringify(sectionProps[p])}
                </Text>
              ))}
            </Box>
          </Box>
          <Box fontSize="lg">
            Make sure you add {name} in
            <chakra.span fontWeight="bold">
              {" "}
              ContentRenderer switch{" "}
            </chakra.span>
            function.
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};
