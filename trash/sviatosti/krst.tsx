import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../components/Shared/Container/Container";
import Layout from "../../components/Shared/Layout/Layout";
import { MarkdownRenderer } from "../../components/Shared/MarkdownRenderer/MarkdownRenderer";

export const query = graphql`
  query useBaptismPage {
    strapiAdminPages(slug: { eq: "krst" }) {
      ...AdminPagesFragment
    }
  }
`;

const BaptismPage = (props: any) => {
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

export default BaptismPage;
