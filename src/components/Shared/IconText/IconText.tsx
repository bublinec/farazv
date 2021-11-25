import { Box, BoxProps, HStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export interface IconTextProps extends BoxProps {
  icon: ReactNode;
  text: string;
}

export const IconText = (props: IconTextProps) => {
  const { icon, text, fontSize="sm", ...restOfProps } = props;
  return (
    <Box {...restOfProps} color="lightGray" fontSize="md">
      <HStack alignItems={"center"} spacing={1}>
        <Box>{icon}</Box>
        <Box fontSize={fontSize} fontWeight={200}>
          {text}
        </Box>
      </HStack>
    </Box>
  );
};
