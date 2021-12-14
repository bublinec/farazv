import { Box, BoxProps, HStack } from "@chakra-ui/react";
import React from "react";
import { HiArrowNarrowLeft, HiArrowNarrowRight } from "react-icons/hi";

export interface ArrowButtonProps extends BoxProps {
  label?: string;
  leftIcon?: boolean;
  rightIcon?: boolean;
}

export const ArrowButton = (props: ArrowButtonProps) => {
  const {
    label = "ZISTIŤ VIAC",
    leftIcon = false,
    rightIcon = true,
    fontWeight = 400,
    color = "secondary",
    ...restOfProps
  } = props;
  return (
    <Box
      {...restOfProps}
      color={color}
      _hover={{
        color: color === "secondary" ? "secondaryShade" : "primaryShade"
      }}
      letterSpacing={1.5}
      p={2}
      cursor={"pointer"}
      fontWeight={fontWeight}
    >
      <HStack alignItems={"center"} spacing={1}>
        {leftIcon && (
          <Box pb={0.5}>
            <HiArrowNarrowLeft />
          </Box>
        )}
        <Box textTransform={"uppercase"} fontSize="sm">
          {label}
        </Box>
        {rightIcon && (
          <Box pb={0.5}>
            <HiArrowNarrowRight />
          </Box>
        )}
      </HStack>
    </Box>
  );
};
