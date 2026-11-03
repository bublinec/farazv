import { Box, Stack } from "@chakra-ui/layout";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { BlogHomeSection } from "../../../components/Blog/BlogHomeSection";
import { Text } from "../../../components/ContentSections/Text/Text";
import { DynamicZoneRenderer } from "../../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../../components/Shared/Layout/Layout";
import * as React from 'react';


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
                width: 1020
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
      <Stack
        spacing={{ base: 4, md: 16 }}
        py={{ base: 10, md: 14 }}
        alignItems="center"
      >
        <Box maxW="container.lg" mx="auto" px={4}>
          <Text
            title={article.title}
            superscript="Naše spoločenstvo"
            date={article.published_at}
            author={article.author?.name}
          />
          <Box boxShadow="xl" w="full">
            {extractedImage && (
              <GatsbyImage image={extractedImage} alt={article.title} />
            )}
          </Box>
        </Box>
        <DynamicZoneRenderer
          contentSections={article.contentSections}
          maxW="container.lg"
        />
      </Stack>
      <BlogHomeSection
        mb={{ base: 16, md: 20 }}
        heading={{
          title: "Ostatné príspevky",
          superscript: "Naše spoločenstvo"
        }}
        excludedBlogSlug={article.slug}
      />
    </Layout>
  );
};

export default ArticlePage;
