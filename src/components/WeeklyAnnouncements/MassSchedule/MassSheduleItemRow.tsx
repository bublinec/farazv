import { Box, BoxProps, Flex, Text } from "@chakra-ui/react";
import React from "react";

export interface MassScheduleItemRowProps extends BoxProps {
  time: string;
  name: string;
  value: string;
}

export const MassScheduleItemRow = (props: MassScheduleItemRowProps) => {
  const { time, name, value, ...restOfProps } = props;

  return (
    <Box fontSize={"md"} fontWeight={300} {...restOfProps}>
      <Flex>
        <Text w={{ base: 12, md: 12 }}>{time}</Text>
        <Text w={{ base: 84, md: 24 }} fontWeight={500} color="primary">
          {name}
        </Text>
        <Text flex={1}>{value}</Text>
      </Flex>
    </Box>
  );
};
