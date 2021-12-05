import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { RecentBlogs } from "../../../components/Blog/RecentBlogs";
import Layout from "../../../components/Shared/Layout/Layout";

export const query = graphql`
  query useBlogPage {
    STRAPI {
      adminPages(where: { slug: "nase-spolocenstvo" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const BlogPage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];

  return (
    <Layout page={page}>
      <Stack spacing={{ base: 10, md: 16 }} py={16}>
        <RecentBlogs />
        {/* <LastPieces /> */}
        {/* <BlogArchive /> */}
      </Stack>
    </Layout>
  );
};

export default BlogPage;
