import { Box } from "@chakra-ui/react";
import React from "react";
import { PartnersSectionProps } from "../../../lib/features/page/content-sections.d.";
import { Container } from "../../Shared/Container/Container";
import { ImageLinks } from "../ImageLinks/ImageLinks";

export const PartnersSection = (props: PartnersSectionProps) => {
  const { heading, partners } = props;
  return (
    <Box>
      <Container maxW={"container.md"}>
        <ImageLinks images={partners} heading={heading} />
      </Container>
    </Box>
  );
};
