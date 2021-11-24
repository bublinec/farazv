import { graphql, useStaticQuery } from "gatsby";

export const usePriests = (): any => {
  const data = useStaticQuery(graphql`
    query usePriests {
      allStrapiPriests {
        nodes {
          role
          title
          email
          guest
          name
          phone
          surname
          photo {
            localFile {
              childImageSharp {
                gatsbyImageData(
                  placeholder: TRACED_SVG
                  height: 280
                  width: 240
                  quality: 90
                )
              }
            }
          }
        }
      }
    }
  `);

  return data.allStrapiPriests.nodes;
};
