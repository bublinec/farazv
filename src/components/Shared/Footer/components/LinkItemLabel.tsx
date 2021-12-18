import { Box, BoxProps, HStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export interface LinkItemLabelProps extends BoxProps {
  label: string | ReactNode;
  icon?: ReactNode;
}

export const LinkItemLabel = (props: LinkItemLabelProps) => {
  const { icon, label, color = "white", ...restOfProps } = props;
  return (
    <Box {...restOfProps} color={color} py={1}>
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
