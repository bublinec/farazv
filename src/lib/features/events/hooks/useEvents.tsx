import { graphql, useStaticQuery } from "gatsby";

export const useEvents = (): any[] => {
  const data = useStaticQuery(graphql`
    query useEvents {
      allStrapiEvents {
        nodes {
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
          }
        }
      }
    }
  `);

  return data.allStrapiEvents.nodes;
};
