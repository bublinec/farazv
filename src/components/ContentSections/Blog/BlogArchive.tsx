import { Box, Center, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import React from "react";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";

interface BlogArchiveProps {}

export const BlogArchive = (props: BlogArchiveProps) => {
  const years = [
    [
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar"
    ],
    [
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar"
    ],
    [
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar"
    ],
    [
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar"
    ],
    [
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar"
    ],
    [
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar"
    ],
    [
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar",
      "Januar"
    ]
  ];
  return (
    <Flex flexDir="column" marginX={7} display={{ base: "none", md: "flex" }}>
      <SectionHeading heading={"Archív"} superscript="Naše Spoločenstvo" />
      <SimpleGrid spacing={10} py={18} columns={7}>
        {years.map((year) => {
          return (
            <Flex flexDir="column">
              <Text fontSize="xl" color="primary">
                2019
              </Text>
              {year.map((month) => {
                return <Text>{month}</Text>;
              })}
            </Flex>
          );
        })}
      </SimpleGrid>
    </Flex>
  );
};
