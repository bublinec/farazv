import { Box, Stack } from "@chakra-ui/layout";
import { Container } from "@chakra-ui/react";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { BlogHomeSection } from "../../../components/Blog/BlogHomeSection";
import { Text } from "../../../components/ContentSections/Text/Text";
import { DynamicZoneRenderer } from "../../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../../components/Shared/Layout/Layout";

export const query = graphql`
  query useArticlePageData($slug: String) {
    STRAPI {
      articles(where: { slug: $slug }) {
        author {
          name
        }
        contentSections {
          ...STRAPI_ArticleFragment
        }
        description
        published_at
        slug
        title
        image {
          localFile {
            childImageSharp {
              gatsbyImageData(
                placeholder: BLURRED
                height: 680
                width: 1200
                quality: 90
              )
            }
          }
          url
        }
      }
    }

    STRAPI {
      adminPages(where: { slug: "nase-spolocenstvo" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const ArticlePage = (props: any) => {
  const article = props.data.STRAPI.articles[0];
  const page = props.data.STRAPI.adminPages[0];
  const extractedImage = getImage(article.image.localFile);

  return (
    <Layout page={page}>
      <Stack spacing={{ base: 4, md: 16 }} py={{ base: 10, md: 14 }} mb={10}>
        <Container maxW="container.lg">
          <Text
            title={article.title}
            superscript="Naše spoločenstvo"
            info={article.published_at}
            mb={4}
          />
          <Box boxShadow="xl" w="full">
            {extractedImage && (
              <GatsbyImage image={extractedImage} alt={article.title} />
            )}
          </Box>
        </Container>
        <DynamicZoneRenderer contentSections={article.contentSections} />
        <BlogHomeSection
          heading={{
            title: "Prečítajte si aj",
            superscript: "Naše spoločenstvo"
          }}
          excludedBlogSlug={article.slug}
        />
      </Stack>
    </Layout>
  );
};

export default ArticlePage;
