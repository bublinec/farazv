import { Stack } from "@chakra-ui/layout";
import { graphql } from "gatsby";
import React from "react";
import { Text } from "../../components/ContentSections/Text/Text";
import { PostsHomeSection } from "../../components/Home/Posts/PostsHomeSection";
import { Container } from "../../components/Shared/Container/Container";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";

export const query = graphql`
  query usePost($slug: String) {
    strapiPost(slug: { eq: $slug }) {
      title
      published_at
      slug
      content
      description
    }

    STRAPI {
      adminPages(where: { slug: "prispevky" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const PostPage = (props: any) => {
  const post = props.data.strapiPost;
  const page = props.data.STRAPI.adminPages[0];

  return (
    <Layout page={page}>
      <Stack spacing={{ base: 4, md: 16 }} pt={{ base: 10, md: 14 }}>
        <Container maxW="container.lg">
          <Text
            title={post.title}
            superscript="Príspevky"
            info={post.published_at}
            content={post.content}
          />
        </Container>
        <PostsHomeSection
          mb={{ base: 16, md: 20 }}
          heading={{
            title: "Prečítajte si aj",
            superscript: "Príspevky"
          }}
          excludedPostSlug={post.slug}
        />

        <DynamicZoneRenderer
          contentSections={page.contentSections}
          pt={{ base: 8, md: 12 }}
        />
      </Stack>
    </Layout>
  );
};

export default PostPage;
