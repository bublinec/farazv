import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../components/Shared/Container/Container";
import Layout from "../../components/Shared/Layout/Layout";
import { MarkdownRenderer } from "../../components/Shared/MarkdownRenderer/MarkdownRenderer";

export const query = graphql`
  query useAltarBoysPage {
    strapiPage(slug: { eq: "ministranti" }) {
      ...PageFragment
    }
  }
`;

const AltarBoysPage = (props: any) => {
  const page = props.data.strapiPage;

  return (
    <Layout page={page}>
      <Container className="py-12 md:py-20">
        <Stack spacing={{ base: 6, md: 12 }}>
          <MarkdownRenderer headingSuperscript={page.title}>
            {page.content}
          </MarkdownRenderer>
          {/* custom section may come here */}
        </Stack>
      </Container>
    </Layout>
  );
};

export default AltarBoysPage;
