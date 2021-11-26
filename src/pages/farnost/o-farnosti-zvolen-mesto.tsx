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
      <TextAndPicTable
        isAlternate={true}
        TextAndPicS={[
          {
            text: "string",
            img_src: "https://www.befunky.com/images/wp/wp-2014-08-milky-way-1023340_1280.jpg?auto=webp&format=jpg&width=1136&crop=16:9",
            heading: "string"
          },{
            text: "string",
            img_src: "https://www.befunky.com/images/wp/wp-2014-08-milky-way-1023340_1280.jpg?auto=webp&format=jpg&width=1136&crop=16:9",
            heading: "string"
          },{
            text: "string",
            img_src: "https://www.befunky.com/images/wp/wp-2014-08-milky-way-1023340_1280.jpg?auto=webp&format=jpg&width=1136&crop=16:9",
            heading: "string"
          }
        ]}
      />
    </Layout>
  );
};

export default AboutParishPage;
