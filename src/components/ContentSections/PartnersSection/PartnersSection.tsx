import { Box } from "@chakra-ui/react";
import React from "react";
import { PartnersSectionProps } from "../../../lib/features/page/content-sections.d.";
import { Container } from "../../Shared/Container/Container";
import { ImageLinks } from "../ImageLinks/ImageLinks";

export const PartnersSection = (props: PartnersSectionProps) => {
  const { heading, partners, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Container maxW={"container.md"}>
        <ImageLinks images={partners} heading={heading} />
      </Container>
    </Box>
  );
};
