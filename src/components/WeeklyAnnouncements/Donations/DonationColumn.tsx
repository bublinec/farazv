import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";

export interface DonationColumnProps extends BoxProps {}

export const DonationColumn = (props: DonationColumnProps) => {
  const { ...restOfProps } = props;
  return <Box {...restOfProps}>DonationColumn</Box>;
};
