import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../src/components/Shared/Container/Container";
import Layout from "../../src/components/Shared/Layout/Layout";
import { SectionHeading } from "../../src/components/Shared/SectionHeading/SectionHeading";

export const query = graphql`
  query useBlogPage {
    strapiAdminPages(slug: { eq: "nase-spolocenstvo" }) {
      ...AdminPagesFragment
    }
  }
`;

const BlogPage = (props: any) => {
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

export default BlogPage;
