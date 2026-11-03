import { Box, BoxProps, Flex } from "@chakra-ui/react";
import React from "react";

export interface LogoProps extends BoxProps {}

export const Logo = (props: LogoProps) => {
  const { ...restOfProps } = props;
  return (
    <Flex
      {...restOfProps}
      flexDir={"column"}
      alignItems="flex-start"
      color="white"
    >
      <Box fontSize={"xl"} textTransform="uppercase">
        Farnosť sv. Alžbety
      </Box>
      <Box fontSize="xs" mt={-1.5} fontWeight={300}>
        Zvolen - mesto
      </Box>
    </Flex>
  );
};
