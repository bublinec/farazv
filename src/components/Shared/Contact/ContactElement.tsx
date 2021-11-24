import { Box, BoxProps, Flex, Text } from "@chakra-ui/react";
import React from "react";

// each component should extend BoxProps
// because then you can pass it any styling props (like color, padding, margin from outside)
// you can create a snippet for it
export interface ContactElementProps extends BoxProps {
  title: string;
  value: string;
}

export const ContactElement = (props: ContactElementProps) => {
  const { title, value, ...restOfProps } = props;

  return (
    <Box {...restOfProps} fontSize={"lg"}>
      <Flex>
        <Text w={24} fontWeight={300}>
          {title}:
        </Text>

        <Text fontWeight={500} color="primary">
          {value}
        </Text>
      </Flex>
    </Box>
  );
};
