import { Box, Flex, SimpleGrid, Stack } from "@chakra-ui/react";
import React from "react";
import { isMajorFeast } from "../../../lib/utils/dateUtils";
import { IconDivider } from "../../Shared/IconDivider/IconDivider";
import { Superscript } from "../../Shared/Superscript/Superscript";
import { MassInfo, MassInfoProps } from "./MassInfo";

export interface MassTimesCarouselItemProps {
  liturgy: string;
  date: string;
  items: MassInfoProps[];
}

export const MassTimesCarouselItem = (props: MassTimesCarouselItemProps) => {
  const { liturgy, date, items } = props;
  const isFeast = isMajorFeast(date);
  const dateFormatted = new Date(date).toLocaleString("sk", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  let size = items.length === 3 || items.length > 4 ? "xs" : "md";

  return (
    <Flex
      flexDir={"column"}
      justifyContent={"center"}
      px={1}
      color="white"
      h={{ base: 520, md: 560 }}
    >
      <Stack justifyContent={"space-between"} w="full" alignItems="center">
        <Stack alignItems="center" spacing={{ base: 0, md: 2 }}>
          <Superscript color="secondary">Dnešná liturgia</Superscript>
          <Box
            fontSize={{ base: "3xl", md: "5xl" }}
            textTransform="uppercase"
            fontWeight={500}
            textAlign="center"
          >
            {liturgy}
          </Box>
          <IconDivider />
          <Box fontSize={{ base: "xl", md: "2xl" }} fontWeight={300}>
            {dateFormatted}
          </Box>
        </Stack>
        <SimpleGrid
          w={{ base: "full", md: "auto" }}
          gap={{
            base: size === "xs" ? 3 : 6,
            sm: 8,
            md: items.length === 4 ? 8 : 10,
            lg: items.length > 4 ? (items.length > 5 ? 8 : 12) : 16
          }}
          alignItems="center"
          columns={{
            base: items.length < 3 || items.length === 4 ? 2 : 3,
            md: items.length === 6 ? 3 : items.length,
            lg: 6
          }}
          pt={{ base: 6, md: items.length === 4 ? 2 : 10, lg: 12 }}
        >
          {items.map((mass) => {
            return <MassInfo {...mass} size={size} />;
          })}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
};
