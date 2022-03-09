import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { HLine } from "./HLine";

export interface UnderlineProps extends BoxProps {}

export const Underline = (props: UnderlineProps) => {
  const { alignItems = "flex-start", ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Stack spacing={{base: 0.5, md: 1}} alignItems={alignItems}>
        <HLine />
        <HLine w={8 / 12} />
      </Stack>
    </Box>
  );
};
