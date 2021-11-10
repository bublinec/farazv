import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../components/Shared/Container/Container";
import Layout from "../../components/Shared/Layout/Layout";
import { MarkdownRenderer } from "../../components/Shared/MarkdownRenderer/MarkdownRenderer";

export const query = graphql`
  query useEucharistPage {
    strapiAdminPages(slug: { eq: "svate-prijimanie" }) {
      ...AdminPagesFragment
    }
  }
`;

const EucharistPage = (props: any) => {
  const page = props.data.strapiAdminPages;

  return (
    <Layout page={page}>
      <Container className="py-12 md:py-20">
        <MarkdownRenderer>{page.content}</MarkdownRenderer>
        <Stack spacing={{ base: 6, md: 12 }}></Stack>
      </Container>
    </Layout>
  );
};

export default EucharistPage;
