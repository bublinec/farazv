import { graphql, useStaticQuery } from "gatsby";

export const useGroups = (): any => {
  const data = useStaticQuery(graphql`
    query useGroups {
      strapiGlobal {
        groups {
          backgroundImage {
            localFile {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED, quality: 90)
              }
            }
          }
          heading {
            superscript
            title
            content
          }
          paragraphs {
            content
            link
            title
          }
        }
      }
    }
  `);

  return data.strapiGlobal.groups;
};
