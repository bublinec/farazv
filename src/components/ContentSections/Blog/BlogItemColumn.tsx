import {
  Box,
  Center,
  Flex,
  Stack,
  Icon,
  Text,
  Image,
  Link
} from "@chakra-ui/react";
import React from "react";
import { BsPerson } from "react-icons/bs";
import { FaRegCalendarAlt, FaClock } from "react-icons/fa";
import { ContactElement } from "../../Shared/Contact/ContactElement";
import { IconText } from "../../Shared/IconText/IconText";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";

export interface BlogItemColumnProps {
  img: string;
  title: string;
  author: string;
  date: string;
  time: string;
  content: string;
}

export const BlogItemColumn = (props: BlogItemColumnProps) => {
  const { img, title, author, date, time, content } = props;
  return (
    <Box maxW="300px" border="1px" borderColor="gray.200">
      <Image src={img} w="full" />
      <Box marginY={4}>
        <Text ml={3} mr={7} marginY={3} fontSize="xl" fontWeight={500}>
          {title}
        </Text>
        <Flex color="grey.400" fontSize="xs" isInline width="100%" item>
          <IconText icon={<BsPerson />} text={author} />
          <IconText icon={<FaRegCalendarAlt />} text={date} />
          <IconText icon={<FaClock />} text={time} />
        </Flex>
        <Text ml={3} mr={7} marginY={3} noOfLines={3}>
          {content}
        </Text>
      </Box>
      <Box w="100%" display="flex" justifyContent="center" pt={2} pb={2}>
        <LinkButton children="Čítaj ďalej" to={title} />
      </Box>
    </Box>
  );
};
