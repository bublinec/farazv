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

  let size = items.length === 3 ? "xs" : "md";

  return (
    <Flex
      w="full"
      flexDir={"column"}
      justifyContent={"center"}
      px={1}
      color="white"
      h={{ base: 560, md: 560 }}
    >
      <Stack
        justifyContent={"space-between"}
        spacing={{ md: 16 }}
        w="full"
        alignItems="center"
      >
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
          w={{ base: "full", sm: "auto" }}
          gap={{ base: size === "xs" ? 3 : 6, sm: 8, md: 10, lg: 16 }}
          alignItems="center"
          columns={{
            base: items.length > 3 ? 2 : items.length,
            md: items.length
          }}
          mt={{ base: 10, md: 16 }}
        >
          {items.map((mass) => {
            return <MassInfo {...mass} size={size} />;
          })}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
};
