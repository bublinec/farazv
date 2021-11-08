import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../components/Shared/Container/Container";
import Layout from "../../components/Shared/Layout/Layout";
import { MarkdownRenderer } from "../../components/Shared/MarkdownRenderer/MarkdownRenderer";
import { SEO } from "../../components/Shared/SEO/SEO";

// TODO: COME BACK TO THIS PATTERN AND IF OK COPY TO ALL OTHER PAGES

export const query = graphql`
  query usePage {
    strapiPage(slug: { eq: "ministranti" }) {
      content
      title
      image {
        localFile {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, quality: 100)
          }
        }
      }
      slug
      useGlobalSlideshow
    }
  }
`;

const AltarBoysPage = (props: any) => {
  const page = props.data.strapiPage;

  return (
    <Layout heroImage={page.image} heroTitle={page.title}>
      <SEO description="This is an AltarBoys page" />
      <Container className="py-12 md:py-20">
        <Stack spacing={{ base: 6, md: 12 }}>
          <MarkdownRenderer headingSuperscript="Miništranti">
            {page.content}
          </MarkdownRenderer>
        </Stack>
      </Container>
    </Layout>
  );
};

export default AltarBoysPage;
