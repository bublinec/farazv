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
      fontWeight={fontWeight}
    >
      <Link to={href}>
        <HStack alignItems={"center"} spacing={1}>
          <Box textTransform={"uppercase"} fontSize="sm">
            {label}
          </Box>
          <Box pb={0.5}>
            <HiArrowNarrowRight />
          </Box>
        </HStack>
      </Link>
    </Box>
  );
};
