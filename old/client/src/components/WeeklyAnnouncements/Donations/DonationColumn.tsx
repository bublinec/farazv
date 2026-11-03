import { Box, BoxProps, Flex, Heading, Stack } from "@chakra-ui/react";
import React from "react";

export interface DonationColumnProps extends BoxProps {
  heading: string;
  donations: [
    {
      name: string;
      amount: number | string;
    }
  ];
}

export const DonationColumn = (props: DonationColumnProps) => {
  const { heading, donations, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Heading fontSize="lg" fontWeight={500} mb={1}>
        {heading}
      </Heading>
      <Stack spacing={0.5}>
        {donations.map((donation) => {
          return (
            <Flex gridGap={2}>
              <Box>
                {donation.name} {donation.amount}
              </Box>
            </Flex>
          );
        })}
      </Stack>
    </Box>
  );
};
