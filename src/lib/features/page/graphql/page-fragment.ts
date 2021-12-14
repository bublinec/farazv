import { graphql } from "gatsby";

export const pageFragment = graphql`
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
        paragraphs {
          content
          image {
            ...STRAPI_UploadFileFragment
          }
        }
      }

      ... on STRAPI_ComponentSectionsMultiParagraphImageBanner {
        __typename
        backgroundImage {
          localFile {
            childImageSharp {
              gatsbyImageData(placeholder: BLURRED, quality: 90)
            }
          }
          url
        }
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
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: TRACED_SVG
                  width: 400
                  height: 400
                  quality: 90
                )
              }
            }
            url
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
          image {
            ...STRAPI_UploadFileFragment
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
        button {
          external
          link
          text
          type
        }
      }

      ... on STRAPI_ComponentSectionsIframes {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        iframes {
          url
        }
        button {
          external
          link
          text
          type
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
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: TRACED_SVG
                  width: 480
                  height: 640
                  quality: 90
                )
              }
            }
            url
          }
        }
      }
      ... on STRAPI_ComponentSectionsPartnersSection {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        useGlobalConfiguration
        partners {
          url
          image {
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: TRACED_SVG
                  quality: 100
                  height: 180
                )
              }
            }
            url
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
        paragraphs {
          content
          image {
            ...STRAPI_UploadFileFragment
          }
        }
      }
      ... on STRAPI_ComponentSectionsMultiParagraphImageBanner {
        __typename
        backgroundImage {
          localFile {
            childImageSharp {
              gatsbyImageData(placeholder: BLURRED, quality: 90)
            }
          }
          url
        }
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
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: TRACED_SVG
                  width: 400
                  height: 400
                  quality: 90
                )
              }
            }
            url
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
          image {
            ...STRAPI_UploadFileFragment
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
        button {
          external
          link
          text
          type
        }
      }

      ... on STRAPI_ComponentSectionsIframes {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        iframes {
          url
        }
        button {
          external
          link
          text
          type
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
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: TRACED_SVG
                  width: 480
                  height: 640
                  quality: 90
                )
              }
            }
            url
          }
        }
      }

      ... on STRAPI_ComponentSectionsPartnersSection {
        __typename
        heading {
          ...STRAPI_ComponentSectionsTextFragment
        }
        useGlobalConfiguration
        partners {
          url
          image {
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: TRACED_SVG
                  quality: 100
                  height: 180
                )
              }
            }
            url
          }
        }
      }
    }
  }

  fragment STRAPI_ArticleFragment on STRAPI_ArticleContentSectionsDynamicZone {
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
      paragraphs {
        content
        image {
          ...STRAPI_UploadFileFragment
        }
      }
    }
    ... on STRAPI_ComponentSectionsMultiParagraphImageBanner {
      __typename
      backgroundImage {
        localFile {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, quality: 90)
          }
        }
        url
      }
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
          localFile {
            childImageSharp {
              gatsbyImageData(
                placeholder: TRACED_SVG
                width: 400
                height: 400
                quality: 100
              )
            }
          }
          url
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
        image {
          ...STRAPI_UploadFileFragment
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
      button {
        external
        link
        text
        type
      }
    }

    ... on STRAPI_ComponentSectionsIframes {
      __typename
      heading {
        ...STRAPI_ComponentSectionsTextFragment
      }
      iframes {
        url
      }
      button {
        external
        link
        text
        type
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
          localFile {
            childImageSharp {
              gatsbyImageData(
                placeholder: TRACED_SVG
                width: 480
                height: 640
                quality: 90
              )
            }
          }
          url
        }
      }
    }

    ... on STRAPI_ComponentSectionsPartnersSection {
      __typename
      heading {
        ...STRAPI_ComponentSectionsTextFragment
      }
      useGlobalConfiguration
      partners {
        url
        image {
          localFile {
            childImageSharp {
              gatsbyImageData(
                placeholder: TRACED_SVG
                quality: 100
                height: 180
              )
            }
          }
          url
        }
      }
    }
  }
`;
