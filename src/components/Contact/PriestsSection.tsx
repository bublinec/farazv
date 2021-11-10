import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { usePriests } from "../../lib/features/priests/hooks/usePriests";

export interface PriestsSectionProps extends BoxProps {}

export const PriestsSection = (props: PriestsSectionProps) => {
  const { ...restOfProps } = props;

  const data = usePriests();
  console.log(data);

  return <Box {...restOfProps}>PriestsSection</Box>;
};
