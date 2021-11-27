import {
  Box,
  BoxProps,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react";
import React from "react";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import MassScheduleItem from "./MassScheduleItem";

export interface MassSchedule extends BoxProps {}

export const MassSchedule = (props: MassSchedule) => {
  const { ...restOfProps } = props;
  console.log();

  return (
    <Box>
      <SectionHeading
        heading="Rozpis svätých omší"
        superscript="Farské oznamy"
      />
      <SimpleGrid columns={1} {...restOfProps} spacing={2}>
        <MassScheduleItem
          day={"asascc"}
          date={new Date().toLocaleDateString()}
          items={[
            {
              time: "19:00",
              name: "Kraus",
              value: "sadvasdvvsd"
            },
            {
              time: "19:00",
              name: "Kraus",
              value: "sadvasdvvsd"
            }
          ]}
          group="asgavffvfv"
        />
        <MassScheduleItem
          day={"asascc"}
          date={new Date().toLocaleDateString()}
          items={[
            {
              time: "19:00",
              name: "Kraus",
              value: "sadvasdvvsd"
            },
            {
              time: "19:00",
              name: "Kraus",
              value: "sadvasdvvsd"
            }
          ]}
          group="asgavffvfv"
        />
        
      </SimpleGrid>
    </Box>
  );
};
