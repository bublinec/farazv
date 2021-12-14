import { Box, Flex, Stack } from "@chakra-ui/react";
import React from "react";
import { isMajorFeast } from "../../../lib/utils/dateUtils";
import { MassInfo, MassInfoProps } from "./MassInfo";

export interface MassTimesCarouselItemProps {
  liturgy: string;
  date: string;
  items: MassInfoProps[];
}

export const MassTimesCarouselItem = (props: MassTimesCarouselItemProps) => {
  const { liturgy, date, items, ...restOfProps } = props;
  const isFeast = isMajorFeast(date);

  return (
    <Flex w="full" justifyContent={"center"} color="white" {...restOfProps}>
      <Stack spacing={16} w="full" alignItems="center" pt={28}>
        <Box fontSize="5xl" textTransform="uppercase" fontWeight={500}>
          {liturgy}
        </Box>
        <Flex gridGap={{ md: 16 }} justifyContent={"center"} w="full" mt={16}>
          {items.map((mass) => {
            return <MassInfo {...mass} />;
          })}
        </Flex>
      </Stack>
    </Flex>
  );
};
