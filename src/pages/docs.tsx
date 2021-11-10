import { graphql } from "gatsby";
import React from "react";
import { ContentRenderer } from "../components/Shared/ContentRenderer/ContentRenderer";
import Layout from "../components/Shared/Layout/Layout";

export const query = graphql`
  query useDocsPage {
    STRAPI {
      adminPages(where: { slug: "docs" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const DocsPage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];
  
  return (
    <Layout page={page}>
      <ContentRenderer contentSections={page.contentSections} />
    </Layout>
  );
};

export default DocsPage;
