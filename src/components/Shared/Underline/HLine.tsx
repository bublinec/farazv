import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface HLineProps extends BoxProps {}

export const HLine = (props: HLineProps) => {
  const { bg = "secondary", h = "2px", w = "full", ...restOfProps } = props;
  return <Box {...restOfProps} w={w} h={h} bg={bg} />;
};
