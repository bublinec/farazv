import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { BlogHomeSection } from "../components/Blog/BlogHomeSection";
import { PostsHomeSection } from "../components/Home/Posts/PostsHomeSection";
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
  const staticComponentIndex = 2;

  return (
    <Layout page={page} home>
      <Stack spacing={{ base: 6, md: 12 }} pt={{ base: 10, md: 16 }}>
        {/* <DynamicZoneRenderer contentSections={[page.contentSections[0]]} /> */}
        <PostsHomeSection
          heading={{
            title: "Najnovšie príspevky",
            superscript: "Farnosť"
          }}
        />
        <DynamicZoneRenderer
          contentSections={page.contentSections.slice(0, staticComponentIndex)}
        />
        <BlogHomeSection
          heading={{
            title: "Naše spoločenstvo",
            superscript: "Farnosť"
          }}
        />
        <DynamicZoneRenderer
          contentSections={page.contentSections.slice(staticComponentIndex)}
          pt={{ base: 8, md: 12 }}
        />
      </Stack>
    </Layout>
  );
};
export default HomePage;
