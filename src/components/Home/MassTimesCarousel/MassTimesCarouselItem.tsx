import { Box, Flex, SimpleGrid, Stack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { IconDivider } from "../../Shared/IconDivider/IconDivider";
import { Superscript } from "../../Shared/Superscript/Superscript";
import { BROWSER_BAR_WIDTH } from "../Hero/Hero";
import { MassInfo, MassInfoProps } from "./MassInfo";

export interface MassTimesCarouselItemProps {
  liturgy: string;
  date: string;
  items: MassInfoProps[];
}

const itemsNumberLayoutMap: { [key: number]: any } = {
  1: {
    columns: 1,
    size: "md"
  },
  2: {
    columns: 2,
    size: "md"
  },
  3: {
    columns: 3,
    size: "xs"
  },
  4: {
    columns: { base: 2, sm: 4 },
    size: "md"
  },
  5: {
    columns: { base: 3, md: 5 },
    size: "xs"
  },
  6: {
    columns: { base: 3, md: 6 },
    size: "xs"
  }
};

export const MassTimesCarouselItem = (props: MassTimesCarouselItemProps) => {
  const { liturgy, date, items } = props;
  // const isFeast = isMajorFeast(date);
  const dateFormatted = new Date(date).toLocaleString("sk", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const [height, setHeight] = useState(650);

  useEffect(() => {
    setHeight(window.innerHeight - BROWSER_BAR_WIDTH - 80);
  }, []);


  return (
    <Flex
      flexDir={"column"}
      justifyContent={"center"}
      px={1}
      color="white"
      minH="full"
      flex={1}
      height={{
        base: height,
        md: "630px"
      }}
    >
      <Stack justifyContent={"space-between"} w="full" alignItems="center">
        <Stack alignItems="center" spacing={{ base: 0, md: 2 }}>
          <Superscript color="secondary">Dnešná liturgia</Superscript>
          <Box
            fontSize={{ base: "3xl", sm: "3xl", lg: "5xl" }}
            textTransform="uppercase"
            fontWeight={500}
            textAlign="center"
          >
            {liturgy}
          </Box>
          <IconDivider />
          <Box fontSize={{ base: "lg", sm: "2xl" }} fontWeight={300}>
            {dateFormatted}
          </Box>
        </Stack>
        <SimpleGrid
          pt={6}
          w={{ base: "full", md: "auto" }}
          columns={itemsNumberLayoutMap[items.length].columns}
          gridGap={{
            base: itemsNumberLayoutMap[items.length].size === "xs" ? 4 : 6,
            md: 10
          }}
        >
          {items.map((mass) => {
            return (
              <MassInfo
                {...mass}
                size={itemsNumberLayoutMap[items.length].size}
              />
            );
          })}
        </SimpleGrid>
      </Stack>
    </Flex>
  );
};
