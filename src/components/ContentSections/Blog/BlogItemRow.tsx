import {
  Box,
  Center,
  Flex,
  Stack,
  Icon,
  Text,
  Image,
  SimpleGrid,
  GridItem,
  Link
} from "@chakra-ui/react";
import React from "react";
import { BsPerson } from "react-icons/bs";
import { FaRegCalendarAlt, FaClock } from "react-icons/fa";
import { BlogItemColumnProps } from "./BlogItemColumn";

export const BlogItemRow = (props: BlogItemColumnProps) => {
  const { img, title, author, date, time, content } = props;
  return (
    <Box maxW="full" border="1px" borderColor="gray.200" mt={4}>
      <SimpleGrid columns={12}>
        <GridItem colSpan={{ base: 12, md: 5 }}>
          <Image src={img} h="100%" overflowX="hidden" />
        </GridItem>
        <GridItem colSpan={{ base: 12, md: 5 }}>
          <Box marginY={4} ml={{ md: 5 }}>
            <Text ml={3} mr={7} marginY={3} fontSize="xl" fontWeight={500}>
              {title}
            </Text>
            <Center w="100%">
              <Flex color="grey.400" fontSize="xs" isInline width="100%">
                <Stack marginX={3} isInline>
                  <Icon as={BsPerson} w={4} h={4} />
                  <Text>{author}</Text>
                </Stack>
                <Box height="100%" W={1} bg="grey.500" />
                <Stack marginX={3} isInline>
                  <Icon as={FaRegCalendarAlt} w={4} h={4} />
                  <Text>{date}</Text>
                </Stack>
                <Box height="100%" W={1} bg="grey.500" />
                <Stack marginX={3} isInline>
                  <Icon as={FaClock} w={4} h={4} />
                  <Text>{time}</Text>
                </Stack>
              </Flex>
            </Center>
            <Text ml={3} mr={7} marginY={3} noOfLines={3}>
              {content}
            </Text>
            <Box w="100%" display="flex" justifyContent="center" pt={2} pb={2}>
              <Link
                href={"blog/" + title}
                color="blue.900"
                _hover={{
                  backgroundColor: "blue.600",
                  color: "white",
                  fontWeight: 450
                }}
              >
                <Box border="2px" borderColor="blue.900">
                  <Text marginX={2} marginY={1}>
                    Čítaj ďalej
                  </Text>
                </Box>
              </Link>
            </Box>
          </Box>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
};
