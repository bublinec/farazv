import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../components/Shared/Container/Container";
import Layout from "../components/Shared/Layout/Layout";
import { SectionHeading } from "../components/Shared/SectionHeading/SectionHeading";

export const query = graphql`
  query useContactPage {
    strapiAdminPages(slug: { eq: "kontakt" }) {
      ...AdminPagesFragment
    }
  }
`;

const ContactPage = (props: any) => {
  const page = props.data.strapiAdminPages;

  return (
    <Layout page={page}>
      <Container className="py-12 md:py-20">
        <Stack spacing={{ base: 6, md: 12 }}>
          <SectionHeading heading="Obsah pripravujeme" superscript="Farnosť" />
        </Stack>
      </Container>
    </Layout>
  );
};

export default ContactPage;
