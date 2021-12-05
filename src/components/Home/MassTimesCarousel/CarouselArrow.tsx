import { Box, BoxProps } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export interface CarouselArrowProps extends BoxProps {
  icon: ReactNode;
}

export const CarouselArrow = (props: CarouselArrowProps) => {
  const { icon, ...restOfProps } = props;
  return (
    <Box
      fontSize="4xl"
      cursor="pointer"
      color="white"
      zIndex={30}
      _hover={{ color: "gray.200" }}
      {...restOfProps}
    >
      {icon}
    </Box>
  );
};
