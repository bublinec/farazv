import { Box, BoxProps, SimpleGrid, Stack } from "@chakra-ui/react";
import React from "react";
import { usePriests } from "../../../lib/features/priests/hooks/usePriests";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import { PriestCard } from "./PriestsCard";

export interface PriestsSectionProps extends BoxProps {}

export const PriestsSection = (props: PriestsSectionProps) => {
  const { ...restOfProps } = props;

  const priests = usePriests();

  return (
    <Box {...restOfProps}>
      <Stack spacing={{ base: 4, md: 5 }}>
        <SectionHeading superscript="Kontakt" heading="Kňazi našej farnosti" />
        <SimpleGrid
          columns={{ base: 2, sm: 2, md: 4 }}
          gap={{ base: 4, md: 6 }}
          w="full"
        >
          {priests.map((priest: any) => {
            return (
              <PriestCard
                role={priest.role}
                title={`${priest.title || ""} ${priest.name} ${priest.surname}`}
                photo={priest.photo}
                email={priest.mail}
                phone={priest.phone}
              />
            );
          })}
        </SimpleGrid>
      </Stack>
    </Box>
  );
};
