import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../src/components/Shared/Container/Container";
import Layout from "../../src/components/Shared/Layout/Layout";
import { MarkdownRenderer } from "../../src/components/Shared/MarkdownRenderer/MarkdownRenderer";

export const query = graphql`
  query useParishHistoryPage {
    strapiAdminPages(slug: { eq: "historia-farnosti" }) {
      ...AdminPagesFragment
    }
  }
`;

const ParishHistoryPage = (props: any) => {
  const page = props.data.strapiAdminPages;

  return (
    <Layout page={page}>
      <Container className="py-12 md:py-20">
        <Stack spacing={{ base: 6, md: 12 }}>
          <MarkdownRenderer>{page.content}</MarkdownRenderer>
        </Stack>
      </Container>
    </Layout>
  );
};

export default ParishHistoryPage;
