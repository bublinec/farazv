import { Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { AnnouncementsSection } from "../components/Home/Announcements/AnnouncementsSection";
import { Container } from "../components/Shared/Container/Container";
import Layout from "../components/Shared/Layout/Layout";

export const pageFragment = graphql`
  fragment PageFragment on StrapiPage {
    content
    title
    description
    slug
    useGlobalSlideshow
    image {
      localFile {
        childImageSharp {
          gatsbyImageData(placeholder: BLURRED, quality: 100)
        }
      }
      url
    }
    slideshow {
      buttons {
        external
        link
        text
        type
      }
      description
      superscript
      title
      image {
        localFile {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, quality: 100)
          }
        }
        url
      }
    }
  }

  fragment AdminPagesFragment on StrapiAdminPages {
    content
    title
    description
    slug
    useGlobalSlideshow
    image {
      localFile {
        childImageSharp {
          gatsbyImageData(placeholder: BLURRED, quality: 100)
        }
      }
      url
    }
    slideshow {
      buttons {
        external
        link
        text
        type
      }
      description
      superscript
      title
      image {
        localFile {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, quality: 100)
          }
        }
        url
      }
    }
  }
`;

const HomePage = () => (
  <Layout home>
    <Container className="py-12 md:py-20">
      <Stack spacing={{ base: 6, md: 12 }}>
        <AnnouncementsSection />
      </Stack>
    </Container>
  </Layout>
);

export default HomePage;
