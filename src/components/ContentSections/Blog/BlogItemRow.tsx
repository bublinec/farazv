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
import { IconText } from "../../Shared/IconText/IconText";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";
import { BlogItemColumnProps } from "./BlogItemColumn";

export const BlogItemRow = (props: BlogItemColumnProps) => {
  const { img, title, author, date, time, content } = props;
  return (
    <Box maxW="full" border="1px" borderColor="gray.200" mt={4}>
      <SimpleGrid columns={12}>
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Image src={img} h="100%" overflowX="hidden" />
        </GridItem>
        <GridItem
          colSpan={{ base: 12, md: 6 }}
          display="flex"
          justifyContent="center"
        >
          <Box marginY={4} ml={{ md: 5 }} maxW="100%">
            <Text mr={7} marginY={3} fontSize="xl" fontWeight={500}>
              {title}
            </Text>
            <Flex color="grey.400" fontSize="xs" isInline width="100%" item>
              <IconText icon={<BsPerson />} text={author} />
              <IconText icon={<FaRegCalendarAlt />} text={date} />
              <IconText icon={<FaClock />} text={time} />
            </Flex>
            <Text mr={7} marginY={3} noOfLines={3}>
              {content}
            </Text>
            <LinkButton children="Čítaj ďalej" to={title} />
          </Box>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
};
