import { Box, BoxProps, Flex, Stack, Text } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { InfoNote } from "../InfoNote/InfoNote";
import { ContactElement, ContactElementProps } from "./ContactElement";
// import Info from './Info';
interface ContactBoxProps extends BoxProps {
  heading: string;
  info?: string;
  children?: ReactNode | ReactNode[];
  items: ContactElementProps[];
}

export const ContactBox = (props: ContactBoxProps) => {
  const { heading, info, items, children, ...restOfProps } = props;
  return (
    <Box {...restOfProps} h="full">
      {/* stack is basically a flex with direction column, with a spacing between elements */}
      <Stack h="full" spacing={{ base: 1, md: 2 }}>
        <Flex
          flexDir={{ base: "column", md: "row" }}
          gridGap={{ base: 0, md: 3 }}
          alignItems={{ base: "flex-start", md: "center" }}
        >
          <Text fontSize="2xl">{heading}</Text>
          {info && <InfoNote text={info} />}
        </Flex>
        {children && <Box flex={1}>{children}</Box>}
        <Stack spacing={1}>
          {items.map((item) => (
            <ContactElement title={item.title} value={item.value} />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};
