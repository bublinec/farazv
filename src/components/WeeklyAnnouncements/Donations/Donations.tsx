import { Box, BoxProps, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { Subheading } from "../../Shared/Subheading/Subheading";
import { DonationColumn } from "./DonationColumn";

export interface DonationsProps extends BoxProps {
  donations: Object;
}

const donationTypeMap: { [key: string]: string } = {
  weddings: "Zo svadby",
  funerals: "Z pohrebu",
  baptism: "Z krstu",
  urnBurials: "Z kladenia urny",
  other: "Iné"
};

export const Donations = (props: DonationsProps) => {
  const { donations, ...restOfProps } = props;
  const donationEntries = Object.entries(donations).filter(
    (i) => i[1].length > 0
  );

  return (
    <Box {...restOfProps}>
      <Subheading>Milodary</Subheading>
      <SimpleGrid
        columns={{
          base: 1,
          md: donationEntries.length > 4 ? 3 : donationEntries.length
        }}
        spacing={{ base: 6, md: 5 }}
        mt={3}
        gap={2}
      >
        {donationEntries.map(([key, value]) => (
          <DonationColumn heading={donationTypeMap[key]} donations={value} />
        ))}
      </SimpleGrid>
    </Box>
  );
};
