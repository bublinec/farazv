import { Stack } from "@chakra-ui/layout";
import { graphql } from "gatsby";
import React from "react";
import { ContactDetailsSection } from "../components/Contact/ContactDetailsSection/ContactDetailsSection";
import { ContactFormSection } from "../components/Contact/ContactForm/ContactFormSection";
import { PriestsSection } from "../components/Contact/PriestsSection/PriestsSection";
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
      <Container maxW={"container.lg"}>
        <Stack spacing={{ base: 8, md: 10 }} pt={12}>
          <ContactDetailsSection />
          <Stack spacing={4}>
            <ContactFormSection />
            <PriestsSection />
          </Stack>
        </Stack>
      </Container>
      <DynamicZoneRenderer
        contentSections={page.contentSections}
        pb={14}
        pt={6}
      />
    </Layout>
  );
};

export default ContactPage;
