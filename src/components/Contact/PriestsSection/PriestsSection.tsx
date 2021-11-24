import { BoxProps, SimpleGrid, Stack } from "@chakra-ui/react";
import React from "react";
import { usePriests } from "../../../lib/features/priests/hooks/usePriests";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import { PriestCard } from "./PriestsCard";

export interface PriestsSectionProps extends BoxProps {}

export const PriestsSection = (props: PriestsSectionProps) => {
  const { ...restOfProps } = props;

  const priests = usePriests();

  return (
    <Stack isInline={false}>
      <SectionHeading superscript="Kontakt" heading="Kňazi našej farnosti" />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} w="full">
        {priests.map((priest: any) => {
          return (
            <PriestCard
              role={priest.role}
              title={`${priest.title || ""} ${priest.name} ${priest.surname}`}
              photo={
                priest.photo.localFile.childImageSharp.gatsbyImageData.images
                  .fallback.src
              }
              email={priest.mail}
              phone={priest.phone}
            />
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};
