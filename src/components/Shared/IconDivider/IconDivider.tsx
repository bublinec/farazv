import { Box, BoxProps, Flex } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { HLine } from "./HLine";

export interface IconDividerProps extends BoxProps {
  icon?: string | ReactNode;
}

export const IconDivider = (props: IconDividerProps) => {
  const { icon = <Box>&#x2629;&#xFE0E;</Box>, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Flex alignItems={"center"} gridGap={4}>
        <HLine w={12} />
        <Box fontSize="5xl">{icon}</Box>
        <HLine w={12} />
      </Flex>
    </Box>
  );
};
