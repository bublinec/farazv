import { Box, BoxProps, HStack } from "@chakra-ui/react";
import { Link } from "gatsby";
import React from "react";
import { HiArrowNarrowRight } from "react-icons/hi";

export interface ArrowLinkProps extends BoxProps {
  label?: string;
  href: string;
}

export const ArrowLink = (props: ArrowLinkProps) => {
  const {
    label = "ZISTIŤ VIAC",
    href,
    color = "secondary",
    ...restOfProps
  } = props;
  return (
    <Box {...restOfProps} color={color} letterSpacing={1.5}>
      <Link to={href}>
        <HStack alignItems={"center"}>
          <Box textTransform={"uppercase"} fontSize="sm">
            {label}
          </Box>
          <Box>
            <HiArrowNarrowRight />
          </Box>
        </HStack>
      </Link>
    </Box>
  );
};
