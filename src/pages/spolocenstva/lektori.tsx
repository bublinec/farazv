import { graphql } from "gatsby";
import React from "react";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";

export const query = graphql`
  query useLectorsPage {
    STRAPI {
      pages(where: { slug: "lektori" }) {
        ...STRAPI_PageFragment
      }
    }
  }
`;

const LectorsPage = (props: any) => {
  const page = props.data.STRAPI.pages[0];

  return (
    <Layout page={page}>
      <DynamicZoneRenderer
        contentSections={page.contentSections}
        py={{ base: 8, md: 12 }}
      />
    </Layout>
  );
};

export default LectorsPage;
