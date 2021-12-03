import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { capitalize, formatTime } from "../../../lib/utils/stringUtils";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import MassScheduleItem from "./MassScheduleItem";

export interface MassSchedule extends BoxProps {
  days: WeeklyAnnouncements.Day[];
}

export const MassSchedule = (props: MassSchedule) => {
  const { days, ...restOfProps } = props;

  return (
    <Box {...restOfProps}>
      <SectionHeading
        heading="Rozpis svätých omší"
        superscript="Farské oznamy"
      />
      <Stack spacing={3}>
        {Object.values(days).map((day) => {
          const date = new Date(day.date);
          return (
            <MassScheduleItem
              key={day.date}
              day={capitalize(date.toLocaleString("sk", { weekday: "long" }))}
              date={day.date}
              items={day.masses.map((mass) => {
                return {
                  time: formatTime(mass.time),
                  name: mass.priest.surname,
                  value: mass.intention
                };
              })}
              iconText={day.liturgy}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
