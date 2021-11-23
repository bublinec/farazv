import { Box, BoxProps, Container, Stack,Center, Grid, Flex, Spacer } from "@chakra-ui/react";
import React from "react";
import { usePriests } from "../../lib/features/priests/hooks/usePriests";
import PriestsBox from "../Shared/Priests/PriestsBox";
import { SectionHeading } from "../Shared/SectionHeading/SectionHeading";

export interface PriestsSectionProps extends BoxProps {}

export const PriestsSection = (props: PriestsSectionProps) => {
  const { ...restOfProps } = props;

  const data = usePriests();
  console.log(data);

  return (
    <Center width="98%">
      <Stack isInline={false}>
        <SectionHeading superscript="Kontakt" heading="Kňazi našej farnosti"/>
        <Grid templateColumns="repeat(4, 1fr)" gap={3}>
          <PriestsBox name={data.name} surname={data.surname} photo={data.photo.localFile.childImageSharp.gatsbyImageData.images.fallback.src} email={data.mail} phone={data.phone}/>
          <PriestsBox name={data.name} surname={data.surname} photo={data.photo.localFile.childImageSharp.gatsbyImageData.images.fallback.src} email={data.mail} phone={data.phone}/>

        </Grid>
      </Stack>
    </Center>
  )
};
