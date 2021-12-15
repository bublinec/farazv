import { graphql } from "gatsby";
import React from "react";
import { DynamicZoneRenderer } from "../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../components/Shared/Layout/Layout";

export const query = graphql`
  query useDocsPage {
    STRAPI {
      adminPages(where: { slug: "dokumentacia" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const DocsPage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];

  return (
    <Layout page={page}>
      <DynamicZoneRenderer
        contentSections={page.contentSections}
        py={{ base: 8, md: 20 }}
      />
    </Layout>
  );
};

export default DocsPage;
