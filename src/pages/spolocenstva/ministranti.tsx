import { graphql } from "gatsby";
import React from "react";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";

export const query = graphql`
  query useAltaryBoysPage {
    STRAPI {
      pages(where: { slug: "ministranti" }) {
        ...STRAPI_PageFragment
      }
    }
  }
`;

const AltaryBoysPage = (props: any) => {
  const page = props.data.STRAPI.pages[0];

  return (
    <Layout page={page}>
      <DynamicZoneRenderer
        contentSections={page.contentSections.slice(
          0,
          page.contentSections.length - 1
        )}
        pt={{ base: 8, md: 20 }}
        maxW={"container.lg"}
        mx={"auto"}
      />
      <DynamicZoneRenderer
        contentSections={[
          page.contentSections[page.contentSections.length - 1]
        ]}
        pt={{ base: 10, md: 16 }}
      />
    </Layout>
  );
};

export default AltaryBoysPage;
