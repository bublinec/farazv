import { BoxProps, SimpleGrid, Stack } from "@chakra-ui/react";
import React from "react";
import { usePriests } from "../../../lib/features/priests/hooks/usePriests";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import { PriestCard } from "./PriestsCard";

export interface PriestsSectionProps extends BoxProps {}

export const PriestsSection = (props: PriestsSectionProps) => {
  const { ...restOfProps } = props;

  const data = usePriests();
  console.log(data);

  return (
    <Stack isInline={false}>
      <SectionHeading superscript="Kontakt" heading="Kňazi našej farnosti" />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={3} w="full">
        <PriestCard
          name={data.name}
          surname={data.surname}
          photo={
            data.photo.localFile.childImageSharp.gatsbyImageData.images.fallback
              .src
          }
          email={data.mail}
          phone={data.phone}
        />
        <PriestCard
          name={data.name}
          surname={data.surname}
          photo={
            data.photo.localFile.childImageSharp.gatsbyImageData.images.fallback
              .src
          }
          email={data.mail}
          phone={data.phone}
        />
        <PriestCard
          name={data.name}
          surname={data.surname}
          photo={
            data.photo.localFile.childImageSharp.gatsbyImageData.images.fallback
              .src
          }
          email={data.mail}
          phone={data.phone}
        />

        <PriestCard
          name={data.name}
          surname={data.surname}
          photo={
            data.photo.localFile.childImageSharp.gatsbyImageData.images.fallback
              .src
          }
          email={data.mail}
          phone={data.phone}
        />
      </SimpleGrid>
    </Stack>
  );
};
