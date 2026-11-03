import { Box, BoxProps, HStack, Stack } from "@chakra-ui/react";
import React from "react";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { Container } from "../../Shared/Container/Container";
import { IconDivider } from "../../Shared/IconDivider/IconDivider";

export interface QuotationSectionProps extends BoxProps {
  quote?: string;
  author?: string;
}

export const QuotationSection = (props: QuotationSectionProps) => {
  const { quote, author, ...restOfProps } = props;
  return (
    <Box bg="gray.100" {...restOfProps} py={{ base: 6, md: 10 }}>
      <Container>
        <Stack alignItems={"center"} textAlign={"center"}>
          <HStack alignItems="flex-start" spacing={4}>
            <Box fontSize="3xl" color="gray.300" pt={2}>
              <FaQuoteLeft />
            </Box>
            <Box>{quote}</Box>
            <Box fontSize="3xl" color="gray.300" pt={2}>
              <FaQuoteRight />
            </Box>
          </HStack>
          <IconDivider />
          <Box textTransform={"uppercase"} pt={1}>
            {author}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
