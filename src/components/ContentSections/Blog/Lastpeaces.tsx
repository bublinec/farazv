import { Box, Center, Link, SimpleGrid, Text } from "@chakra-ui/react";
import React from "react";
import { Image } from "../../../lib/features/image/model/image.model";

interface LastpeacesProps {
  description?: string;
  items: Array<{
    month: string;
    picture?: Image;
  }>;
}

export const Lastpeaces = (props: LastpeacesProps) => {
  return (
    <Box w="100%" h="450px" backgroundColor="black" mb={20}>
      <Center flexDir="column" pt={6}>
        <Text color="secondary">Farnosť</Text>
        <Text fontSize="xl" color="white">
          Posledné čísla
        </Text>
        <Box h={0.5} w={60} backgroundColor="grey" borderRadius={6} mb={1} />
        <Box h={0.5} w={57} backgroundColor="grey" borderRadius={6} mb={3} />
        <Text maxW="400px" minH="60px">
          {props.description}
        </Text>
        <SimpleGrid spacing={5} py={5} columns={3}>
          {props.items.slice(0, 3).map((item) => {
            return (
              <Box w="200px" h="300px" backgroundColor="grey">
                <Link href={`${window.location.pathname}/${item.month}`}>
                  <Text
                    mt="200px"
                    w="100%"
                    h={12}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    fontSize="xl"
                    color="black"
                    backgroundColor="rgba(0,0,0,0.5)"
                  >
                    {item.month}
                  </Text>
                </Link>
              </Box>
            );
          })}
        </SimpleGrid>
      </Center>
    </Box>
  );
};
