import { graphql } from "gatsby";
import React from "react";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";

export const query = graphql`
  query useMarrriagePage {
    STRAPI {
      adminPages(where: { slug: "sviatost-manzelstva" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const MarrriagePage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];

  return (
    <Layout page={page}>
      <DynamicZoneRenderer
        contentSections={page.contentSections}
        py={{ base: 8, md: 12 }}
      />
    </Layout>
  );
};

export default MarrriagePage;
