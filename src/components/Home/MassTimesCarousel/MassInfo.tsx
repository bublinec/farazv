import { Box, BoxProps, Flex, Stack } from "@chakra-ui/react";
import React from "react";

export interface MassInfoProps extends BoxProps {
  time: string;
  name: string;
  label: string;
}

export const MassInfo = (props: MassInfoProps) => {
  const { time, name, label, ...restOfProps } = props;
  return (
    <Box borderWidth={1} borderColor={"white"} w={48} h={32} {...restOfProps}>
      <Stack alignItems="center" spacing={0} mt={4}>
        <Flex flexDir="column" alignItems="center">
          <Box h={4} fontWeight={300} textTransform={"uppercase"} fontSize="sm">
            {label}
          </Box>
          <Box color="secondary" fontSize={"3xl"} h={10}>
            {name}
          </Box>
        </Flex>
        <Box fontSize={"2xl"} h={6}>
          {time}
        </Box>
      </Stack>
    </Box>
  );
};
