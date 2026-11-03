import { Box, BoxProps, Flex, Stack } from "@chakra-ui/react";
import React from "react";

export interface MassInfoProps extends BoxProps {
  time: string;
  name: string;
  label: string;
  size?: string;
}

export const MassInfo = (props: MassInfoProps) => {
  const { time, name, label, size, ...restOfProps } = props;
  const isXs = size === "xs";
  if (!React) {
    return <div></div>;
  }

  return (
    <Box
      borderWidth={1}
      borderColor={"white"}
      w={{ base: "full", lg: 44 }}
      maxW={{ base: "full", sm: 36, md: 40, lg: 48 }}
      h={{ base: isXs ? 24 : 28, sm: 28, md: 32 }}
      {...restOfProps}
    >
      <Stack
        alignItems="center"
        spacing={0}
        mt={{ base: isXs ? 2 : 3, md: 3 }}
        pt={0.5}
        px={{ base: 0, md: 2, lg: 1 }}
      >
        <Flex flexDir="column" alignItems="center">
          <Box
            h={4}
            w="full"
            // mx={-10}
            fontWeight={300}
            textTransform={"uppercase"}
            textAlign="center"
            fontSize={{ base: "xs", md: "0.8rem" }}
            letterSpacing={"0.02rem"}
          >
            {label}
          </Box>
          <Box
            color="secondary"
            fontSize={{ base: isXs ? "xl" : "2xl", sm: "2xl", md: "1.75rem" }}
            h={{ base: isXs ? 7 : 9, md: 10 }}
          >
            {name}
          </Box>
        </Flex>
        <Box fontSize={{ base: "lg", md: "2xl" }} h={6}>
          {time}
        </Box>
      </Stack>
    </Box>
  );
};
