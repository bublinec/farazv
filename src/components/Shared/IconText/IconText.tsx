import { Box, BoxProps, HStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export interface IconTextProps extends BoxProps {
  icon: ReactNode;
  text: string;
}

export const IconText = (props: IconTextProps) => {
  const { icon, text, ...restOfProps } = props;
  return (
    <Box {...restOfProps} color="lightGray">
      <HStack alignItems={"center"}>
        <Box>{icon}</Box>
        <Box>{text}</Box>
      </HStack>
    </Box>
  );
};
