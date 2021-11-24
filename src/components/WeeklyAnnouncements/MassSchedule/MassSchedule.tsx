import { Box, BoxProps, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import React from "react";
import MassScheduleItem from "./MassScheduleItem";

export interface MassSchedule extends BoxProps {
  
}

export const MassSchedule = (props: MassSchedule) => {
  const { ...restOfProps } = props;
  console.log();

  return (
    <SimpleGrid columns={1} {...restOfProps}>
      <MassScheduleItem day={"asascc"} date={new Date()} />
    </SimpleGrid>
  );
};
