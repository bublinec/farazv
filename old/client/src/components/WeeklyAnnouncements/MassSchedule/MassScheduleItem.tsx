import { Box, Flex, Stack } from "@chakra-ui/react";
import React from "react";
import { BiBookBookmark } from "react-icons/bi";
import { IconDate } from "../../Shared/IconDate/IconDate";
import { IconText } from "../../Shared/IconText/IconText";
import { MassScheduleItemRow } from "./MassSheduleItemRow";

export interface MassScheduleItemProps {
  day: string;
  date: string;
  iconText: string;
  items: {
    time: string;
    name: string;
    value: string;
  }[];
}

const MassScheduleItem = (props: MassScheduleItemProps) => {
  const { day, date, iconText, items, ...restOfProps } = props;
  return (
    <Box
      border="1px"
      borderColor="gray.200"
      p={{ base: 2, md: 3 }}
      {...restOfProps}
    >
      <Stack spacing={3}>
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
      </Stack>
    </Box>
  );
};

export default MassScheduleItem;
