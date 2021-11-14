import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { ContentRenderer } from "../components/Shared/ContentRenderer/ContentRenderer";
import Layout from "../components/Shared/Layout/Layout";

export const query = graphql`
  query useHomePage {
    STRAPI {
      adminPages(where: { slug: "index" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const HomePage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];
  return (
    <Layout page={page} home>
      <Stack spacing={{ base: 6, md: 12 }} py={20}>
        <ContentRenderer contentSections={page.contentSections} />
      </Stack>
    </Layout>
  );
};
export default HomePage;
