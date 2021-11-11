import { Box, BoxProps, Flex, Stack } from "@chakra-ui/react";
import React from "react";
import { Subheading } from "../../Shared/Subheading/Subheading";

export interface DonationsProps extends BoxProps {
  donations: any;
}

export const Donations = (props: DonationsProps) => {
  const { donations, ...restOfProps } = props;
  console.log(donations);

  return (
    <Box {...restOfProps}>
      <Subheading mb={2}>Milodary</Subheading>
      <Stack spacing={0.5}>
        {donations.weddings.map((donation: any) => (
          <Flex gridGap={2}>
            <Box>{donation.name}</Box>
            <Box>{donation.amount}</Box>
          </Flex>
        ))}
      </Stack>
      <Subheading mb={2}>Milodary</Subheading>
      <Stack spacing={0.5}>
        {donations.weddings.map((donation: any) => (
          <Flex gridGap={2}>
            <Box>{donation.name}</Box>
            <Box>{donation.amount}</Box>
          </Flex>
        ))}
      </Stack>
      <Subheading mb={2}>Milodary</Subheading>
      <Stack spacing={0.5}>
        {donations.weddings.map((donation: any) => (
          <Flex gridGap={2}>
            <Box>{donation.name}</Box>
            <Box>{donation.amount}</Box>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
};
