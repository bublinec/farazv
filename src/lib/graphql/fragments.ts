import { graphql } from "gatsby";

export const fragments = graphql`
  fragment STRAPI_UploadFileFragment on STRAPI_UploadFile {
    localFile {
      childImageSharp {
        gatsbyImageData(placeholder: BLURRED)
      }
    }
    url
  }

  fragment STRAPI_ComponentSectionsTextFragment on STRAPI_ComponentSectionsText {
    content
    info
    superscript
    title
  }

  fragment STRAPI_AdminPagesFragment on STRAPI_AdminPages {
    title
    slug
    description
    image {
      ...STRAPI_UploadFileFragment
    }
    contentSections {
      ... on STRAPI_ComponentSectionsText {
        __typename
        content
        info
        superscript
        title
      }
      ... on STRAPI_ComponentSectionsImagesTextGrid {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
      }
      ... on STRAPI_ComponentSectionsMultiParagraphImageBanner {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        paragraphs {
          content
          reactIconName
          title
        }
        configuration
      }
      ... on STRAPI_ComponentSectionsBackgroundImageContent {
        __typename
        backgroundImage {
          ...STRAPI_UploadFileFragment
        }
        imageParagraph {
          content
          image {
            ...STRAPI_UploadFileFragment
          }
        }
      }
      ... on STRAPI_ComponentSectionsSlideshow {
        __typename
        id
        useGlogabalConfiguration
        slides {
          buttons {
            external
            link
            text
            type
          }
          heading {
            ...STRAPI_ComponentSectionsTextFragment
          }
        }
      }
      ... on STRAPI_ComponentSectionsGallery {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        images {
          ...STRAPI_UploadFileFragment
        }
      }
      ... on STRAPI_ComponentSectionsAnnouncementsSection {
        __typename
        announcements {
          content
          description
          published_at
          title
          slug
        }
        backgroundImage {
          ...STRAPI_UploadFileFragment
        }
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        useMostRecent
      }
      ... on STRAPI_ComponentSectionsEventsSection {
        __typename
        useMostRecent
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        events {
          link
          poster {
            ...STRAPI_UploadFileFragment
          }
        }
      }
      ... on STRAPI_ComponentSectionsImageLinks {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        useGlobalConfiguration
        images {
          url
          image {
            ...STRAPI_UploadFileFragment
          }
        }
      }
    }
  }

  fragment STRAPI_PageFragment on STRAPI_Page {
    title
    slug
    description
    image {
      ...STRAPI_UploadFileFragment
    }
    contentSections {
      ... on STRAPI_ComponentSectionsText {
        __typename
        content
        info
        superscript
        title
      }
      ... on STRAPI_ComponentSectionsImagesTextGrid {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
      }
      ... on STRAPI_ComponentSectionsMultiParagraphImageBanner {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        paragraphs {
          content
          reactIconName
          title
        }
        configuration
      }
      ... on STRAPI_ComponentSectionsBackgroundImageContent {
        __typename
        backgroundImage {
          ...STRAPI_UploadFileFragment
        }
        imageParagraph {
          content
          image {
            ...STRAPI_UploadFileFragment
          }
        }
      }
      ... on STRAPI_ComponentSectionsSlideshow {
        __typename
        id
        useGlogabalConfiguration
        slides {
          buttons {
            external
            link
            text
            type
          }
          heading {
            ...STRAPI_ComponentSectionsTextFragment
          }
        }
      }
      ... on STRAPI_ComponentSectionsGallery {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        images {
          ...STRAPI_UploadFileFragment
        }
      }
      ... on STRAPI_ComponentSectionsAnnouncementsSection {
        __typename
        announcements {
          content
          description
          published_at
          title
          slug
        }
        backgroundImage {
          ...STRAPI_UploadFileFragment
        }
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        useMostRecent
      }
      ... on STRAPI_ComponentSectionsEventsSection {
        __typename
        useMostRecent
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        events {
          link
          poster {
            ...STRAPI_UploadFileFragment
          }
        }
      }
      ... on STRAPI_ComponentSectionsImageLinks {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        useGlobalConfiguration
        images {
          url
          image {
            ...STRAPI_UploadFileFragment
          }
        }
      }
    }
  }
`;
