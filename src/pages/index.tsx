import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { MassTimesCarousel } from "../components/Home/MassTimesCarousel/MassTimesCarousel";
import { BlogHomeSection } from "../components/Blog/BlogHomeSection";
import { DynamicZoneRenderer } from "../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
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
  const sectionsNumber = page.contentSections.length;
  const staticComponentIndex = 1;

  return (
    <Layout page={page} home>
      <Stack spacing={{ base: 6, md: 12 }} py={20}>
        <DynamicZoneRenderer
          contentSections={page.contentSections.slice(0, staticComponentIndex)}
          py={{ base: 8, md: 12 }}
        />
        <BlogHomeSection
          heading={{
            title: "Naše spoločenstvo",
            superscript: "Farnosť",
            content:
              "Poprosim poslat text co by sme sem mohli. Pripadne ak mate este nieco co by ste chceli napisat tak to mozeme tiez potom pridat"
          }}
        />
        <DynamicZoneRenderer
          contentSections={page.contentSections.slice(staticComponentIndex)}
          py={{ base: 8, md: 12 }}
        />
      </Stack>
    </Layout>
  );
};
export default HomePage;
