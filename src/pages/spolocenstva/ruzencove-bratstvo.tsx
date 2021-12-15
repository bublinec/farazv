import { graphql } from "gatsby";
import React from "react";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";

export const query = graphql`
  query useRosaryBrotherhoodPage {
    STRAPI {
      pages(where: { slug: "ruzencove-bratstvo" }) {
        ...STRAPI_PageFragment
      }
    }
  }
`;

const RosaryBrotherhoodPage = (props: any) => {
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

export default RosaryBrotherhoodPage;
