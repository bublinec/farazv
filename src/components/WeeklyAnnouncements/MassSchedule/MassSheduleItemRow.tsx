import { Box, BoxProps, Flex, Text } from "@chakra-ui/react";
import React from "react";

// each component should extend BoxProps
// because then you can pass it any styling props (like color, padding, margin from outside)
// you can create a snippet for it
export interface MassScheduleItemRowProps extends BoxProps {
  time: string;
  name: string;
  value:string
}

export const MassScheduleItemRow = (props: MassScheduleItemRowProps) => {
  const { time, name,value, ...restOfProps } = props;

  return (
    <Box {...restOfProps} fontSize={"lg"} pl={2}>
      <Flex>
        <Text w={20} fontWeight={300}>
          {time}
        </Text>

        <Text w={20} fontWeight={500} color="primary">
          {name}
        </Text>
        <Text fontWeight={300}>
          {value}
        </Text>
      </Flex>
    </Box>
  );
};