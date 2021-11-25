import { graphql } from "gatsby";
import React from "react";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";

export const query = graphql`
  query useLieskovecPage {
    STRAPI {
      adminPages(where: { slug: "kostol-sv-jana-pavla-v-lieskovci" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const LieskovecPage = (props: any) => {
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

export default LieskovecPage;
