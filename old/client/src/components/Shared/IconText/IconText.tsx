import { Box, BoxProps, HStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export interface IconTextProps extends BoxProps {
  icon: ReactNode;
  text: string;
}

export const IconText = (props: IconTextProps) => {
  const {
    icon,
    text,
    fontSize = "sm",
    color = "lightGray",
    ...restOfProps
  } = props;
  return (
    <Box {...restOfProps} color={color} fontSize="md">
      <HStack alignItems={"center"} spacing={1.5}>
        <Box>{icon}</Box>
        <Box fontSize={fontSize} fontWeight={200}>
          {text}
        </Box>
      </HStack>
    </Box>
  );
};
