import { graphql, useStaticQuery } from "gatsby";

export const useGroups = (): any => {
  const data = useStaticQuery(graphql`
    query useGroups {
      strapiGlobal {
        groups {
          backgroundImage {
            localFile {
              childImageSharp {
                gatsbyImageData
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
