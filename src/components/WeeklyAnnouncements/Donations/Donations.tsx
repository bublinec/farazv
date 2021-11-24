import { Box, BoxProps, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { Subheading } from "../../Shared/Subheading/Subheading";
import { DonationColumn } from "./DonationColumn";

export interface DonationsProps extends BoxProps {
  donations: Object;
}

export const Donations = (props: DonationsProps) => {
  const { donations, ...restOfProps } = props;
  console.log(donations);

  return (
    <Box>
      <Text fontSize="x-large" pb={5}>Milodary</Text>
      <SimpleGrid columns={{base: 1, md: 4 }} spacing={{base: 3, md: 5 }} {...restOfProps}>
        {Object.entries(donations).map(([key, value])=>{
          return <DonationColumn heading={key} donations={value}/>
        })}
      </SimpleGrid>
    </Box>
  );
};
