import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { HLine } from "./HLine";

export interface UnderlineProps extends BoxProps {}

export const Underline = (props: UnderlineProps) => {
  const { ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Stack spacing={1}>
        <HLine />
        <HLine w={8 / 12} />
      </Stack>
    </Box>
  );
};
