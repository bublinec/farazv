import { Box, Stack } from "@chakra-ui/layout";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../components/Shared/Container/Container";
import { IconDate } from "../../components/Shared/IconDate/IconDate";
import Layout from "../../components/Shared/Layout/Layout";
import { MarkdownRenderer } from "../../components/Shared/MarkdownRenderer/MarkdownRenderer";
import { SectionHeading } from "../../components/Shared/SectionHeading/SectionHeading";

export const query = graphql`
  query useAnnouncement($slug: String) {
    strapiAnnouncements(slug: { eq: $slug }) {
      title
      published_at
      slug
      content
      description
    }

    strapiAdminPages(slug: { eq: "vyveska" }) {
      ...AdminPagesFragment
    }
  }
`;

const AnnouncementPage = (props: any) => {
  const announcement = props.data.strapiAnnouncements;
  const page = props.data.strapiAdminPages;

  return (
    <Layout page={page}>
      <Container maxW="container.lg">
        <Stack spacing={{ base: 4, md: 8 }} py={{ base: 10, md: 14 }}>
          <Box>
            <SectionHeading
              heading={announcement.title}
              superscript="Výveska"
            />
            <IconDate dateStr={announcement.published_at} />
          </Box>
          <MarkdownRenderer>{announcement.content}</MarkdownRenderer>
        </Stack>
      </Container>
    </Layout>
  );
};

export default AnnouncementPage;
