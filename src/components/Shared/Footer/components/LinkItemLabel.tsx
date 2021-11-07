import { Box, BoxProps, HStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export interface LinkItemLabelProps extends BoxProps {
  label: string;
  icon?: ReactNode;
}

export const LinkItemLabel = (props: LinkItemLabelProps) => {
  const { icon, label, ...restOfProps } = props;
  return (
    <Box {...restOfProps} color="white" py={1}>
      <HStack>
        {icon && (
          <Box fontSize="xl" py={1}>
            {icon}
          </Box>
        )}
        <Box fontWeight={300}>{label}</Box>
      </HStack>
    </Box>
  );
};
