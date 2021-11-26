import { graphql } from "gatsby";
import React from "react";
import TextAndPic from "../../components/About/TextAndPicComponent/TextAndPic";
import TextAndPicTable from "../../components/About/TextAndPicComponent/TextAndPicTable";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";

export const query = graphql`
  query useAboutParishPage {
    STRAPI {
      adminPages(where: { slug: "o-farnosti-zvolen-mesto" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const AboutParishPage = (props: any) => {
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

export default AboutParishPage;
