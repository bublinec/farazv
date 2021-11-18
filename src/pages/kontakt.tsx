import { Stack } from "@chakra-ui/layout";
import { graphql } from "gatsby";
import React from "react";
import { ContactDetailsSection } from "../components/Contact/ContactDetailsSection";
import { PriestsSection } from "../components/Contact/PriestsSection";
import { Container } from "../components/Shared/Container/Container";
import { DynamicZoneRenderer } from "../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../components/Shared/Layout/Layout";

export const query = graphql`
  query useContactPage {
    STRAPI {
      adminPages(where: { slug: "kontakt" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const ContactPage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];

  return (
    <Layout page={page}>
      <Container>
        <Stack spacing={{ base: 10, md: 14 }} py={20}>
          <ContactDetailsSection />
          <PriestsSection />
        </Stack>
      </Container>
      <DynamicZoneRenderer contentSections={page.contentSections} />
    </Layout>
  );
};

export default ContactPage;
