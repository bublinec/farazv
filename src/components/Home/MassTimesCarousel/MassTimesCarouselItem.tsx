import { Box, Flex, Stack } from "@chakra-ui/react";
import React from "react";
import { BiBookBookmark } from "react-icons/all";
import { isMajorFeast } from "../../../lib/utils/dateUtils";
import { IconDate } from "../../Shared/IconDate/IconDate";
import { IconText } from "../../Shared/IconText/IconText";
import { InfoNote } from "../../Shared/InfoNote/InfoNote";
import { MassScheduleItemRow } from "../../WeeklyAnnouncements/MassSchedule/MassSheduleItemRow";

export interface MassTimesCarouselItemProps {
  day: string;
  date: string;
  iconText: string;
  items: {
    time: string;
    name: string;
    value: string;
  }[];
}

export const MassTimesCarouselItem = (props: MassTimesCarouselItemProps) => {
  const { day, date, iconText, items, ...restOfProps } = props;
  const isFeast = isMajorFeast(date);

  return (
    <Flex w="full" justifyContent={"center"} {...restOfProps}>
      <Stack
        mx="auto"
        maxW={424}
        ml={4}
        spacing={3}
        border="1px"
        borderColor="gray.200"
        w="full"
        bg="white"
        p={3}
      >
        <Box>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            <Box fontSize="2xl" fontWeight={500}>
              {day}
            </Box>
            <IconDate dateStr={date} color="primary" />
          </Flex>
          <IconText icon={<BiBookBookmark />} text={iconText}></IconText>
        </Box>
        <Stack spacing={1}>
          {items.map((row) => {
            return (
              <MassScheduleItemRow
                time={row.time}
                name={row.name}
                value={row.value}
              />
            );
          })}
        </Stack>
        <InfoNote
          text={
            isFeast
              ? "V nedeľu sa nespovedá"
              : "Spovedáme 30 minút pred svätou omšou"
          }
        />
      </Stack>
    </Flex>
  );
};
