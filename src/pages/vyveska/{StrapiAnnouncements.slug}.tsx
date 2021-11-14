import { Stack } from "@chakra-ui/layout";
import { graphql } from "gatsby";
import React from "react";
import { Text } from "../../components/ContentSections/Text/Text";
import { Container } from "../../components/Shared/Container/Container";
import { ContentRenderer } from "../../components/Shared/ContentRenderer/ContentRenderer";
import Layout from "../../components/Shared/Layout/Layout";

export const query = graphql`
  query useAnnouncement($slug: String) {
    strapiAnnouncements(slug: { eq: $slug }) {
      title
      published_at
      slug
      content
      description
    }

    STRAPI {
      adminPages(where: { slug: "vyveska" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const AnnouncementPage = (props: any) => {
  console.log(props.data);

  const announcement = props.data.strapiAnnouncements;
  const page = props.data.STRAPI.adminPages[0];

  return (
    <Layout page={page}>
      <Stack spacing={{ base: 4, md: 16 }} pt={{ base: 10, md: 14 }}>
        <Container maxW="container.lg">
          <Text
            title={announcement.title}
            superscript="Výveska"
            info={announcement.published_at}
            content={announcement.content}
          />
        </Container>
        <ContentRenderer contentSections={page.contentSections} />
      </Stack>
    </Layout>
  );
};

export default AnnouncementPage;
